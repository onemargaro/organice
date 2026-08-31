import { spring } from 'react-motion';

export const prefersReducedMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/** Drop-in replacement for react-motion's spring(): when the user prefers
reduced motion, snaps immediately to the target value instead of animating. */
export const maybeSpring = (value, config) =>
  prefersReducedMotion ? spring(value, { stiffness: 1000, damping: 100 }) : spring(value, config);
