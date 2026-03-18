/**
 * Shared Framer Motion animation variants.
 * Replaces repetitive inline initial/animate props across the app.
 */
import type { Variants, Transition } from 'framer-motion';

// ─────────────────────────────────────────────────────────────
// Springs — the "feel" of the app
// ─────────────────────────────────────────────────────────────

/** Snappy but smooth — for UI responses (buttons, tabs) */
export const springSnap: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 0.8,
};

/** Gentle — for page transitions and cards */
export const springGentle: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 25,
  mass: 1,
};

/** Bouncy — for celebrations and achievements */
export const springBounce: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
  mass: 0.8,
};

// ─────────────────────────────────────────────────────────────
// Page transitions
// ─────────────────────────────────────────────────────────────

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.998 },
};

export const pageTransitionConfig: Transition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1], // ease-out-expo
};

// ─────────────────────────────────────────────────────────────
// Card variants
// ─────────────────────────────────────────────────────────────

/** Cards that stagger in from below */
export const cardStagger: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/** Interactive card hover — lift with shadow */
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -3,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  tap: {
    scale: 0.985,
    transition: { duration: 0.1 },
  },
};

// ─────────────────────────────────────────────────────────────
// Element entrances
// ─────────────────────────────────────────────────────────────

/** Fade up — the default entrance */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Scale pop — for icons and badges */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 20, delay: 0.1 },
  },
};

/** Slide in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Slide in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─────────────────────────────────────────────────────────────
// Celebration / feedback
// ─────────────────────────────────────────────────────────────

/** Success pop — for correct answers */
export const successPop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: [0, 1.15, 1],
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      scale: { type: 'spring', stiffness: 400, damping: 12 },
    },
  },
};

/** Shake — for incorrect answers */
export const shake: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
};

// ─────────────────────────────────────────────────────────────
// Progress
// ─────────────────────────────────────────────────────────────

/** Animated progress bar fill */
export function progressFill(targetPercent: number, delayMs = 0) {
  return {
    initial: { width: '0%' },
    animate: {
      width: `${targetPercent}%`,
      transition: {
        duration: 0.8,
        delay: delayMs / 1000,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Stagger container
// ─────────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};


