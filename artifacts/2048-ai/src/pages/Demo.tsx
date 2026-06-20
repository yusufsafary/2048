import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Play, Bot, Lightbulb, Undo2, Trophy, ArrowRight, Keyboard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2:    { bg: 'bg-[#eee4da]', text: 'text-[#776e65]' },
  4:    { bg: 'bg-[#ede0c8]', text: 'text-[#776e65]' },
  8:    { bg: 'bg-[#f2b179]', text: 'text-white' },
  16:   { bg: 'bg-[#f59563]', text: 'text-white' },
  32:   { bg: 'bg-[#f67c5f]', text: 'text-white' },
  64:   { bg: 'bg-[#f65e3b]', text: 'text-white' },
  128:  { bg: 'bg-[#edcf72]', text: 'text-white' },
  256:  { bg: 'bg-[#edcc61]', text: 'text-white' },
  512:  { bg: 'bg-[#edc850]', text: 'text-white' },
  1024: { bg: 'bg-[#edc53f]', text: 'text-white' },
  2048: { bg: 'bg-[#edc22e]', text: 'text-white' },
};

const DEMO_BOARD = [
  [512, 256, 64, 8],
  [128, 32, 16, 4],
  [64,  16,  8, 2],
  [32,   8,  4, 0],
];

const DEMO_BOARDS: number[][][] = [
  [
    [512, 256, 64, 8],
    [128, 32, 16, 4],
    [64,  16,  8, 2],
    [32,   8,  4, 0],
  ],
  [
    [1024, 512, 256, 128],
    [64,   32,  16,   8],
    [32,   16,   8,   4],
    [0,     0,   0,   2],
  ],
  [
    [2048, 1024, 512, 256],
    [128,   64,  32,  16],
    [8,      4,   2,   0],
    [0,      0,   0,   0],
  ],
];

function Tile({ value }: { value: number }) {
  if (!value) return (
    <div className="w-full aspect-square rounded-lg bg-[#cdc1b4]/40" />
  );
  const col = TILE_COLORS[value] ?? { bg: 'bg-[#3c3a32]', text: 'text-white' };
  const fontSize = value >= 1024 ? 'text-lg font-black' : value >= 128 ? 'text-xl font-black' : 'text-2xl font-black';
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`w-full aspect-square rounded-lg flex items-center justify-center ${col.bg} ${col.text} ${fontSize} tracking-tighter shadow-sm`}
    >
      {value}
    </motion.div>
  );
}

function MiniBoard({ board }: { board: number[][] }) {
  return (
    <div className="bg-[#bbada0] p-2 rounded-xl grid grid-cols-4 gap-1.5 w-48 shadow-lg">
      {board.flat().map((v, i) => (
        <Tile key={i} value={v} />
      ))}
    </div>
  );
}

const features = [
  {
    icon: <Keyboard size={20} />,
    title: 'Arrow Keys / Swipe',
    desc: 'Control with keyboard arrows on desktop or swipe gestures on mobile.',
  },
  {
    icon: <Bot size={20} />,
    title: 'AI Auto-Play',
    desc: 'Let the Expectimax AI take over and watch it reach 2048 (and beyond).',
  },
  {
    icon: <Lightbulb size={20} />,
    title: 'Move Hints',
    desc: 'Enable Suggest mode — AI highlights the best move before you commit.',
  },
  {
    icon: <Undo2 size={20} />,
    title: 'Undo Moves',
    desc: 'Changed your mind? Undo up to 3 moves and try a different strategy.',
  },
  {
    icon: <Trophy size={20} />,
    title: 'Best Score',
    desc: 'Your highest score is saved locally and tracked across sessions.',
  },
  {
    icon: <Smartphone size={20} />,
    title: 'Mobile Ready',
    desc: 'Fully responsive — plays great on any screen size, touch-first.',
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Demo() {
  const [boardIdx, setBoardIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBoardIdx(i => (i + 1) % DEMO_BOARDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            Human Demo
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-foreground mb-4 leading-tight">
            Play <span className="text-primary">2048</span><br />with an AI co-pilot
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto mb-8">
            The classic sliding puzzle — now with a built-in AI that can play for you,
            suggest your next move, or step through the game one turn at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/">
              <Button size="lg" className="gap-2 text-base px-8">
                <Play size={18} /> Play Now
              </Button>
            </Link>
            <Link href="/how-to-play">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                How to Play <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating boards decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center gap-6 mt-14 flex-wrap"
        >
          <div className="opacity-40 rotate-[-8deg] translate-y-4 hidden sm:block">
            <MiniBoard board={DEMO_BOARDS[0]} />
          </div>
          <div className="shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={boardIdx}
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <MiniBoard board={DEMO_BOARDS[boardIdx]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="opacity-40 rotate-[8deg] translate-y-4 hidden sm:block">
            <MiniBoard board={DEMO_BOARDS[2]} />
          </div>
        </motion.div>
      </section>

      {/* How it works - visual walkthrough */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={item} className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tighter mb-2">How it works</h2>
            <p className="text-muted-foreground">Three ways to play — your choice.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Play manually',
                desc: 'Use arrow keys or swipe. Pure strategy, no training wheels.',
                color: 'border-primary/30 bg-primary/5',
                numColor: 'text-primary/20',
              },
              {
                num: '02',
                title: 'Get suggestions',
                desc: 'Enable Suggest — the AI shows you the best move. You decide.',
                color: 'border-amber-500/30 bg-amber-500/5',
                numColor: 'text-amber-400/40',
              },
              {
                num: '03',
                title: 'Watch the AI',
                desc: 'Hit Auto-Play and watch the Expectimax AI solve it in real time.',
                color: 'border-green-500/30 bg-green-500/5',
                numColor: 'text-green-400/40',
              },
            ].map(card => (
              <motion.div
                key={card.num}
                variants={item}
                className={`border rounded-2xl p-6 ${card.color}`}
              >
                <span className={`text-5xl font-black tracking-tighter ${card.numColor}`}>{card.num}</span>
                <h3 className="font-bold text-lg mt-2 mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="px-4 py-16 bg-muted/30 border-y">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={item} className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter mb-2">Everything you need</h2>
              <p className="text-muted-foreground">Built for both casual players and puzzle enthusiasts.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(f => (
                <motion.div
                  key={f.title}
                  variants={item}
                  className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Score showcase */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border rounded-2xl p-8 text-center shadow-sm"
        >
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold mb-2">Tile value showcase</p>
          <div className="flex flex-wrap gap-2 justify-center my-6">
            {[2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048].map(v => {
              const col = TILE_COLORS[v];
              return (
                <motion.div
                  key={v}
                  whileHover={{ scale: 1.12, rotate: [-2, 2, 0] }}
                  transition={{ duration: 0.2 }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-sm shadow-sm cursor-default ${col.bg} ${col.text}`}
                >
                  {v >= 1000 ? <span className="text-xs">{v}</span> : v}
                </motion.div>
              );
            })}
          </div>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Combine tiles to climb from <strong>2</strong> to <strong>2048</strong> — then keep going for maximum score.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-primary text-primary-foreground text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-black tracking-tighter mb-3">Ready to play?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-sm mx-auto">
            Jump straight in — no account needed. Your best score is saved automatically.
          </p>
          <Link href="/">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-10 font-bold"
            >
              <Play size={18} /> Start Playing
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
