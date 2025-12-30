// Micro-interactions for UI elements using Framer Motion

export const microInteractions = {
  // Button press
  button: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },

  // Card hover
  card: {
    whileHover: { y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },

  // Icon button
  iconButton: {
    whileTap: { scale: 0.9, rotate: 5 },
    whileHover: { scale: 1.1 },
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },

  // Toggle/Checkbox
  toggle: {
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },

  // Input focus
  input: {
    whileFocus: { scale: 1.01 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },

  // List item
  listItem: {
    whileTap: { scale: 0.98 },
    whileHover: { x: 4 },
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },

  // Tab
  tab: {
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },

  // Floating action button
  fab: {
    whileTap: { scale: 0.9, rotate: 90 },
    whileHover: { scale: 1.1, rotate: -90 },
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },

  // Badge/Chip
  badge: {
    whileHover: { scale: 1.05 },
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },

  // Slider thumb
  sliderThumb: {
    whileTap: { scale: 1.3 },
    whileHover: { scale: 1.2 },
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
};

// Loading spinner animation
export const spinnerAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

// Pulse animation for notifications/badges
export const pulseAnimation = {
  scale: [1, 1.2, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Shake animation for errors
export const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: {
    duration: 0.4,
  },
};

// Success check animation
export const successCheckAnimation = {
  scale: [0, 1.2, 1],
  opacity: [0, 1, 1],
  transition: {
    duration: 0.5,
    times: [0, 0.6, 1],
    ease: "easeOut",
  },
};

// Slide in from bottom (for modals)
export const slideInFromBottom = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
  transition: { type: "spring", damping: 25, stiffness: 300 },
};

// Fade and scale (for dialogs)
export const fadeAndScale = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.2 },
};

// Ripple effect helper (returns props for motion.div)
export const createRipple = (color: string = "rgba(255, 255, 255, 0.3)") => ({
  initial: { scale: 0, opacity: 1 },
  animate: { scale: 2, opacity: 0 },
  transition: { duration: 0.6 },
  style: {
    position: "absolute" as const,
    borderRadius: "50%",
    background: color,
    pointerEvents: "none" as const,
  },
});
