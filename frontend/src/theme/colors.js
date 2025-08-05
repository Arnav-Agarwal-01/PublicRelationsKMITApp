/**
 * Color palette for the KMIT PR App
 * Modern dark theme with black backgrounds, dark blue accents, and green highlights
 */

export const colors = {
  // Background Colors
  primary: '#000000',        // Pure black for main backgrounds
  secondary: '#1a1a2e',      // Dark blue-black for cards and sections
  tertiary: '#16213e',       // Darker blue for elevated components
  
  // Accent Colors
  accent: '#00ff88',         // Bright green for primary actions
  accentSecondary: '#4ade80', // Softer green for secondary actions
  accentTertiary: '#10b981', // Darker green for hover states
  
  // Text Colors
  textPrimary: '#ffffff',    // White for primary text
  textSecondary: '#e5e7eb',  // Light gray for secondary text
  textTertiary: '#9ca3af',   // Medium gray for tertiary text
  textMuted: '#6b7280',      // Darker gray for muted text
  
  // Status Colors
  success: '#10b981',        // Green for success states
  warning: '#f59e0b',        // Amber for warning states
  error: '#ef4444',          // Red for error states
  info: '#3b82f6',           // Blue for info states
  
  // Border and Divider Colors
  border: '#374151',         // Gray for borders
  divider: '#1f2937',        // Darker gray for dividers
  
  // Input and Form Colors
  inputBackground: '#1f2937', // Dark gray for input backgrounds
  inputBorder: '#374151',     // Gray for input borders
  inputFocus: '#00ff88',      // Green for focused inputs
};

export const gradients = {
  primary: ['#000000', '#1a1a2e'],           // Black to dark blue
  accent: ['#00ff88', '#4ade80'],            // Green gradient
  card: ['#1a1a2e', '#16213e'],              // Dark blue gradient
  button: ['#00ff88', '#10b981'],            // Green button gradient
  background: ['#000000', '#0f0f23'],        // Subtle background gradient
};