#!/usr/bin/env node
/**
 * deploy-github-pages.mjs
 *
 * Full deployment pipeline:
 *  1. Build artifacts/2048-ai with BASE_PATH=/2048/ for GitHub Pages
 *  2. Push full workspace source (excluding node_modules/dist/build-cache) to main branch
 *  3. Push production build (dist/public) to gh-pages branch (orphan commit)
 *  4. Enable GitHub Pages (source: gh-pages branch) — fails hard if this step fails
 *  5. Verify Pages is active via GET and print confirmed live URL
 *
 * Uses only the GitHub REST API — no local git commands required.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";
import { execSync } from "child_process";

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "yusufsafary";
const REPO = "2048";
const DIST_DIR = "artifacts/2048-ai/dist/public";
const WORKSPACE_ROOT = ".";

if (!TOKEN) { console.error("GITHUB_TOKEN is not set"); process.exit(1); }

const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "replit-deploy-script",
};

/**
 * Make a GitHub API call. Throws on any status not in successStatuses.
 */
async function api(method, path, body, successStatuses = [200, 201]) {
  const url = path.startsWith("https://")
    ? path
    : `https://api.github.com/repos/${OWNER}/${REPO}${path}`;
  const res = await fetch(url, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  if (!successStatuses.includes(res.status)) {
    throw Object.assign(
      new Error(`GitHub API ${method} ${path} → ${res.status}: ${JSON.stringify(json).slice(0, 300)}`),
      { status: res.status, data: json }
    );
  }
  return { status: res.status, data: json };
}

// Directory names to skip entirely at any depth
const EXCLUDE_DIRS = new Set([
  "node_modules", "dist", ".git", ".local",
  "attached_assets", ".replit-artifact", ".cache",
]);
// File names to skip
const EXCLUDE_FILES = new Set([
  "pnpm-lock.yaml",
]);
// File extensions to skip
const EXCLUDE_EXTS = new Set([".tsbuildinfo"]);

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue;
      results.push(...walkDir(full));
    } else {
      if (EXCLUDE_FILES.has(entry)) continue;
      if (EXCLUDE_EXTS.has(entry.slice(entry.lastIndexOf(".")))) continue;
      results.push(full);
    }
  }
  return results;
}

function isTextFile(fp) {
  return /\.(ts|tsx|js|jsx|mjs|cjs|html|css|json|svg|txt|md|yaml|yml|toml|xml|map|lock)$/.test(fp);
}

async function createBlob(filePath) {
  const raw = readFileSync(filePath);
  return api("POST", "/git/blobs", {
    content: isTextFile(filePath) ? raw.toString("utf-8") : raw.toString("base64"),
    encoding: isTextFile(filePath) ? "utf-8" : "base64",
  });
}

async function pushFilesToBranch({ files, baseDir, branch, message, parentSha }) {
  console.log(`  Creating blobs for ${files.length} files...`);
  const treeItems = [];
  for (const filePath of files) {
    const { data: blob } = await createBlob(filePath);
    const relPath = relative(baseDir, filePath);
    process.stdout.write(`    ${relPath} → ${blob.sha.slice(0, 7)}\n`);
    treeItems.push({ path: relPath, mode: "100644", type: "blob", sha: blob.sha });
  }

  const { data: tree } = await api("POST", "/git/trees", { tree: treeItems });
  console.log(`  Created tree → ${tree.sha.slice(0, 7)}`);

  const commitBody = {
    message,
    tree: tree.sha,
    author: { name: "Replit Deploy", email: "deploy@replit.com", date: new Date().toISOString() },
  };
  if (parentSha) commitBody.parents = [parentSha];

  const { data: commit } = await api("POST", "/git/commits", commitBody);
  console.log(`  Created commit → ${commit.sha.slice(0, 7)}`);

  // Create or force-update the branch ref
  let refExists = false;
  try {
    await api("GET", `/git/refs/heads/${branch}`, undefined, [200]);
    refExists = true;
  } catch (e) {
    if (e.status !== 404) throw e;
  }

  if (refExists) {
    await api("PATCH", `/git/refs/heads/${branch}`, { sha: commit.sha, force: true }, [200]);
    console.log(`  Force-updated refs/heads/${branch}`);
  } else {
    await api("POST", "/git/refs", { ref: `refs/heads/${branch}`, sha: commit.sha }, [201]);
    console.log(`  Created refs/heads/${branch}`);
  }

  return commit.sha;
}

async function main() {
  // ── Step 1: Build with BASE_PATH=/2048/ ──────────────────────────────────────
  console.log("=== Step 1: Build for GitHub Pages (BASE_PATH=/2048/) ===");
  try {
    execSync(
      "PORT=3000 BASE_PATH=/2048/ NODE_ENV=production pnpm --filter @workspace/2048-ai run build",
      { stdio: "inherit", cwd: process.cwd() }
    );
  } catch (e) {
    console.error("Build failed:", e.message);
    process.exit(1);
  }

  if (!existsSync(`${DIST_DIR}/index.html`)) {
    console.error(`Build output missing: ${DIST_DIR}/index.html not found`);
    process.exit(1);
  }
  const indexHtml = readFileSync(`${DIST_DIR}/index.html`, "utf-8");
  if (!indexHtml.includes("/2048/")) {
    console.error("Built index.html does not reference /2048/ base path — aborting");
    process.exit(1);
  }
  console.log(`✓ Build verified — index.html references /2048/ base path`);

  // ── Step 2: Push workspace source to main ───────────────────────────────────
  console.log("\n=== Step 2: Push workspace source to main branch ===");

  let mainSha = null;
  try {
    const { data: mainRef } = await api("GET", "/git/refs/heads/main", undefined, [200]);
    mainSha = mainRef.object?.sha ?? mainRef[0]?.object?.sha;
    console.log(`  main exists → ${mainSha.slice(0, 7)}`);
  } catch (e) {
    if (e.status === 409 || e.status === 404) {
      console.log("  Repo is empty — initializing main with source as first commit");
    } else throw e;
  }

  const sourceFiles = walkDir(WORKSPACE_ROOT);
  console.log(`  Found ${sourceFiles.length} source files from workspace root`);

  await pushFilesToBranch({
    files: sourceFiles,
    baseDir: WORKSPACE_ROOT,
    branch: "main",
    message: "Add 2048 AI Agent project source",
    parentSha: mainSha,
  });

  // ── Step 3: Push production build to gh-pages (orphan) ───────────────────────
  console.log("\n=== Step 3: Push production build to gh-pages (orphan) ===");
  const distFiles = walkDir(DIST_DIR);
  console.log(`  Found ${distFiles.length} built files`);

  await pushFilesToBranch({
    files: distFiles,
    baseDir: DIST_DIR,
    branch: "gh-pages",
    message: "Deploy 2048 AI Agent to GitHub Pages",
    parentSha: null, // orphan — clean gh-pages history
  });

  // ── Step 4: Enable GitHub Pages (hard fail on error) ─────────────────────────
  console.log("\n=== Step 4: Enable GitHub Pages ===");
  const pagesUrl = `https://api.github.com/repos/${OWNER}/${REPO}/pages`;
  const pagesSource = { source: { branch: "gh-pages", path: "/" } };

  const checkRes = await fetch(pagesUrl, { headers: HEADERS });
  if (checkRes.ok) {
    // Pages already exists — update source
    const patchRes = await fetch(pagesUrl, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify(pagesSource),
    });
    if (!patchRes.ok) {
      const msg = await patchRes.text();
      console.error(`  Pages PATCH failed → ${patchRes.status}: ${msg.slice(0, 300)}`);
      process.exit(1);
    }
    console.log("  Pages source updated");
  } else {
    // Pages doesn't exist — create it
    const postRes = await fetch(pagesUrl, {
      method: "POST",
      headers: { ...HEADERS, Accept: "application/vnd.github.switcheroo-preview+json" },
      body: JSON.stringify(pagesSource),
    });
    if (!postRes.ok && postRes.status !== 409) {
      const msg = await postRes.text();
      console.error(`  Pages POST failed → ${postRes.status}: ${msg.slice(0, 300)}`);
      process.exit(1);
    }
    console.log(`  Pages enabled (status ${postRes.status})`);
  }

  // ── Step 5: Verify Pages is active ───────────────────────────────────────────
  console.log("\n=== Step 5: Verify GitHub Pages ===");
  const verifyRes = await fetch(pagesUrl, { headers: HEADERS });
  if (!verifyRes.ok) {
    console.error(`  Pages verification failed → ${verifyRes.status}`);
    process.exit(1);
  }
  const pagesData = await verifyRes.json();
  console.log(`  status:   ${pagesData.status}`);
  console.log(`  source:   branch=${pagesData.source?.branch}, path=${pagesData.source?.path}`);
  console.log(`  html_url: ${pagesData.html_url}`);

  if (pagesData.source?.branch !== "gh-pages") {
    console.error("  Pages source branch is not gh-pages — configuration may be wrong");
    process.exit(1);
  }

  console.log(`\n✓ All done!`);
  console.log(`  Repo:     https://github.com/${OWNER}/${REPO}`);
  console.log(`  Live URL: ${pagesData.html_url}`);
  console.log(`  (If status is "building", the page will be live within ~2 minutes)`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
