/**
 * Spacing system for consistent layouts
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const animations = {
  // Timing Functions
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Common Animation Configs
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 300,
  },
  slideUp: {
    from: { transform: [{ translateY: 50 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
    duration: 400,
  },
  scaleIn: {
    from: { transform: [{ scale: 0.9 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
    duration: 300,
  },
};