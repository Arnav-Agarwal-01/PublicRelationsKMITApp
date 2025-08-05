/**
 * Typography system for the KMIT PR App
 * Modern font hierarchy with clean styling
 */

import { colors } from './colors';

export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    color: colors.textPrimary,
  },
  
  // Body Text
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  },
  
  // UI Text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textTertiary,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};