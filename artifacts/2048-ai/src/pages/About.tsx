import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Gamepad2, Github, Zap, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: <Gamepad2 size={22} />,
    title: 'Classic 2048',
    desc: 'Slide tiles on a 4×4 grid. Combine matching numbers to reach 2048 — and beyond.',
  },
  {
    icon: <Brain size={22} />,
    title: 'AI Auto-Play',
    desc: 'An Expectimax AI agent plays the game for you at adjustable speed — watch it think.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Move Suggestions',
    desc: 'Not sure where to go? Enable Suggest mode and the AI will highlight the best move.',
  },
  {
    icon: <RotateCcw size={22} />,
    title: 'Undo History',
    desc: 'Made a mistake? Undo up to 3 moves and try a different path.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <div className="min-h-[calc(100dvh-56px)] bg-background px-4 py-12">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Bot size={15} /> AI-Powered 2048
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-3">
            About This Game
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
            A modern reimagining of the classic 2048 puzzle, enhanced with a built-in
            Expectimax AI that can play, suggest, or step through the game — giving you
            a front-row seat to machine decision-making.
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="grid sm:grid-cols-2 gap-4 mb-10"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={item}
          className="bg-card border rounded-xl p-6 shadow-sm"
        >
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Github size={18} /> Open Source
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            This project is open source. The AI uses Expectimax search with a heuristic
            that weighs empty cells, tile monotonicity, and merge potential to choose
            the best move at every step.
          </p>
          <a
            href="https://github.com/yusufsafary/2048"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Github size={15} /> github.com/yusufsafary/2048
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
