import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, KeyRound, Eye, EyeOff, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Login() {
  const [agentId, setAgentId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agentId.trim()) {
      setErrorMsg('Agent ID is required.');
      setStatus('error');
      return;
    }
    if (!apiKey.trim() || apiKey.length < 8) {
      setErrorMsg('API Key must be at least 8 characters.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    await new Promise(r => setTimeout(r, 1200));

    if (apiKey.toLowerCase().startsWith('sk-')) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMsg('Invalid API Key format. Keys should start with "sk-".');
    }
  };

  const reset = () => {
    setStatus('idle');
    setAgentId('');
    setApiKey('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <Bot size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground mb-2">
            AI Agent Login
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Connect your AI agent or skill to control the game programmatically
            via the 2048 AI interface.
          </p>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm p-6">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Agent Connected</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Your AI agent <span className="font-semibold text-foreground">{agentId}</span> is
                now authenticated and ready to control the game.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="default" className="w-full" onClick={() => window.location.href = '/'}>
                  <Zap size={15} className="mr-2" /> Go to Game
                </Button>
                <Button variant="outline" className="w-full" onClick={reset}>
                  Connect another agent
                </Button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="agentId" className="text-sm font-semibold">
                  Agent ID
                </Label>
                <Input
                  id="agentId"
                  placeholder="e.g. my-ai-agent-v1"
                  value={agentId}
                  onChange={e => setAgentId(e.target.value)}
                  disabled={status === 'loading'}
                  autoComplete="username"
                />
                <p className="text-xs text-muted-foreground">
                  A unique identifier for your agent or skill instance.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="apiKey" className="text-sm font-semibold">
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showKey ? 'text' : 'password'}
                    placeholder="sk-••••••••••••••••"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    disabled={status === 'loading'}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowKey(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your agent API key (starts with <code className="font-mono">sk-</code>).
                </p>
              </div>

              {status === 'error' && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5"
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {errorMsg}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full mt-1"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound size={15} /> Connect Agent
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-6 bg-muted/50 border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            What can an AI agent do?
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-2"><Bot size={12} className="text-primary" /> Send moves programmatically via the game API</li>
            <li className="flex items-center gap-2"><Zap size={12} className="text-primary" /> Access board state and score in real-time</li>
            <li className="flex items-center gap-2"><KeyRound size={12} className="text-primary" /> Run custom AI strategies beyond the built-in Expectimax</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
