import { Variants } from 'framer-motion';

// Page transition animations
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Staggered children animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Card animations
export const cardHover: Variants = {
  initial: {},
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Button animations
export const buttonTap = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.05 },
};

// Fade in animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// Slide in from bottom (great for modals/bottom sheets)
export const slideUp: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Scale in (perfect for achievements/PRs)
export const scaleIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
    },
  },
};

// Pulse animation (for highlighting)
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.5,
    repeat: Infinity,
    repeatDelay: 1,
  },
};

// Number count-up animation helper
export function animateNumber(
  from: number,
  to: number,
  duration: number = 1,
  callback: (value: number) => void
) {
  const startTime = Date.now();
  const animate = () => {
    const now = Date.now();
    const progress = Math.min((now - startTime) / (duration * 1000), 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = from + (to - from) * easeOutQuart;

    callback(Math.round(current));

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  animate();
}

// Spring configuration presets
export const springConfigs = {
  gentle: { type: 'spring' as const, stiffness: 100, damping: 15 },
  wobbly: { type: 'spring' as const, stiffness: 180, damping: 12 },
  stiff: { type: 'spring' as const, stiffness: 300, damping: 25 },
  slow: { type: 'spring' as const, stiffness: 80, damping: 20 },
};
