import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bot, Trophy, Undo2, Lightbulb } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Slide the tiles',
    desc: 'Use arrow keys on desktop, or swipe on mobile. All tiles slide as far as possible in the chosen direction.',
    icon: (
      <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
        <div />
        <div className="bg-primary/20 text-primary rounded p-1 flex items-center justify-center"><ArrowUp size={14} /></div>
        <div />
        <div className="bg-primary/20 text-primary rounded p-1 flex items-center justify-center"><ArrowLeft size={14} /></div>
        <div className="bg-primary/20 text-primary rounded p-1 flex items-center justify-center"><ArrowDown size={14} /></div>
        <div className="bg-primary/20 text-primary rounded p-1 flex items-center justify-center"><ArrowRight size={14} /></div>
      </div>
    ),
  },
  {
    step: '02',
    title: 'Merge matching tiles',
    desc: 'When two tiles with the same number collide, they merge into one. The new tile\'s value is their sum.',
    icon: (
      <div className="flex items-center gap-2 font-black text-lg">
        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg w-10 h-10 flex items-center justify-center shadow-sm">4</span>
        <span className="text-muted-foreground">+</span>
        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg w-10 h-10 flex items-center justify-center shadow-sm">4</span>
        <span className="text-muted-foreground">=</span>
        <span className="bg-primary text-primary-foreground rounded-lg w-10 h-10 flex items-center justify-center shadow-sm">8</span>
      </div>
    ),
  },
  {
    step: '03',
    title: 'Reach 2048',
    desc: 'Keep merging tiles to build up to 2048. After reaching it you can keep playing for a higher score!',
    icon: (
      <span className="text-4xl font-black text-primary tracking-tighter">2048</span>
    ),
  },
];

const tips = [
  { icon: <Undo2 size={16} />, text: 'Use Undo (up to 3 times) to recover from a bad move.' },
  { icon: <Lightbulb size={16} />, text: 'Enable Suggest mode to see the AI\'s recommended move without playing automatically.' },
  { icon: <Bot size={16} />, text: 'Watch Auto-Play to learn the AI strategy — it often keeps the biggest tile in a corner.' },
  { icon: <Trophy size={16} />, text: 'Your best score is saved locally and persists across sessions.' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

export default function HowToPlay() {
  return (
    <div className="min-h-[calc(100dvh-56px)] bg-background px-4 py-12">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-3">How to Play</h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            2048 is simple to learn but hard to master. Here's everything you need to know.
          </p>
        </motion.div>

        <div className="flex flex-col gap-5 mb-10">
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={item}
              className="bg-card border rounded-xl p-6 shadow-sm flex gap-5 items-start"
            >
              <div className="shrink-0">
                <span className="text-3xl font-black text-primary/20 tracking-tighter">{s.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                <div className="flex justify-start">{s.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item} className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h2 className="font-bold text-base mb-4">Pro Tips</h2>
          <ul className="flex flex-col gap-3">
            {tips.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 text-primary shrink-0">{t.icon}</span>
                {t.text}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
