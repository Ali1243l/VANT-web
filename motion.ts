/**
 * Motion animation presets and transitions
 */
export { motion, AnimatePresence } from 'motion/react';

export const transitions = {
  spring: {
    type: 'spring',
    stiffness: 380,
    damping: 30,
  },
  smooth: {
    type: 'tween',
    ease: [0.16, 1, 0.3, 1],
    duration: 0.3,
  },
  snappy: {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.2,
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transitions.snappy,
};

export const slideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
  transition: transitions.smooth,
};

export const drawerVariants = {
  rtl: {
    closed: { x: '100%', opacity: 0.8 },
    open: { x: 0, opacity: 1 },
  },
  ltr: {
    closed: { x: '-100%', opacity: 0.8 },
    open: { x: 0, opacity: 1 },
  },
};

export const sheetVariants = {
  right: {
    closed: { x: '100%' },
    open: { x: 0 },
  },
  left: {
    closed: { x: '-100%' },
    open: { x: 0 },
  },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};
