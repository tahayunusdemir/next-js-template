'use client';

import { motion, useReducedMotion } from 'motion/react';

const VIEWPORT = { once: true, margin: '-80px' } as const;

// Fades and lifts children into view the first time they enter the viewport.
// Renders statically (no transform) when the user prefers reduced motion.
export function Reveal(props: { className?: string; delay?: number; children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={props.className}
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: 'easeOut', delay: props.delay ?? 0 }}
    >
      {props.children}
    </motion.div>
  );
}

// Orchestrates a staggered reveal of its RevealItem children as the group enters view.
export function RevealGroup(props: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={props.className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: props.delay ?? 0 } },
      }}
    >
      {props.children}
    </motion.div>
  );
}

// A single staggered child; inherits its animation state from the parent RevealGroup.
export function RevealItem(props: { className?: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={props.className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
    >
      {props.children}
    </motion.div>
  );
}
