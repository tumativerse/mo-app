/**
 * Design Tokens - Single Source of Truth
 *
 * ALL design values must be defined here.
 * NEVER hardcode values in components.
 */

export const tokens = {
  // Colors - Orange as primary accent
  colors: {
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Primary orange
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },

    // Status colors (semantic)
    success: {
      light: '#22c55e',
      dark: '#16a34a',
    },
    warning: {
      light: '#eab308',
      dark: '#ca8a04',
    },
    danger: {
      light: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#3b82f6',
      dark: '#2563eb',
    },

    // Fitness category colors (fixed for semantic meaning)
    fitness: {
      push: '#0BA08B', // Teal
      pull: '#3b82f6', // Blue
      legs: '#ef4444', // Red
      energy: '#f59e0b', // Amber
      mobility: '#8b5cf6', // Purple
      cardio: '#06b6d4', // Cyan
    },
  },

  // Spacing system (8px base)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px (minimum touch target)
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
  },

  // Typography
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px (iOS zoom-safe minimum)
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Border radius
  radius: {
    none: '0',
    sm: '0.25rem', // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    full: '9999px',
  },

  // Touch targets (mobile)
  touchTarget: {
    min: '44px', // iOS minimum
    comfortable: '48px', // More comfortable
    large: '56px', // For primary actions
  },

  // Animation durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Animation easings
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    sm: '640px', // Large phones
    md: '768px', // Tablets
    lg: '1024px', // Desktop
    xl: '1280px', // Large desktop
    '2xl': '1536px', // Extra large
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
} as const;

// Type helper for autocomplete
export type Tokens = typeof tokens;
