import { useState } from 'react';
import { m, useReducedMotion } from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.65, 0, 0.35, 1];

// A "scene": one screen of the app. Scenes cross-fade through darkness,
// like a cut between scenes in a film.
export function Scene({ children, className }) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } }}
      exit={{ opacity: 0, transition: { duration: 0.26, ease: EASE_IN_OUT } }}
    >
      {children}
    </m.div>
  );
}

// Staggered reveal: wrap a group in <Stagger>, mark children with <Reveal>
const groupVariants = (gap, delay) => ({ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } });
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE_OUT } },
};

export function Stagger({ children, className, gap = 0.08, delay = 0, ...rest }) {
  return (
    <m.div className={className} initial="hidden" animate="show" variants={groupVariants(gap, delay)} {...rest}>
      {children}
    </m.div>
  );
}

export function Reveal({ children, className, ...rest }) {
  return (
    <m.div className={className} variants={itemVariants} {...rest}>
      {children}
    </m.div>
  );
}

// Reveals once when scrolled into view (used on the landing page)
export function InView({ children, className, delay = 0, as = 'div', ...rest }) {
  const Tag = as === 'section' ? m.section : as === 'li' ? m.li : m.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// The curtain rises once, when the app first loads
export function CurtainIntro() {
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();
  if (done) return null;
  return (
    <m.div
      className="curtain-intro curtain"
      aria-hidden="true"
      initial={reduceMotion ? { opacity: 1 } : { y: '0%' }}
      animate={reduceMotion ? { opacity: 0 } : { y: '-101%' }}
      transition={{ delay: 0.15, duration: reduceMotion ? 0.3 : 1.05, ease: EASE_IN_OUT }}
      onAnimationComplete={() => setDone(true)}
    />
  );
}
