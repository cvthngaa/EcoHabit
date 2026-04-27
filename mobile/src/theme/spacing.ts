import { Tokens } from './tokens';

export const Spacing = {
  xs: Tokens.space[1],
  sm: Tokens.space[2],
  md: Tokens.space[3],
  base: Tokens.space[4],
  lg: Tokens.space[5],
  xl: Tokens.space[6],
  '2xl': Tokens.space[8],
  '3xl': 40,
  '4xl': Tokens.space[12],
};

export const BorderRadius = {
  sm: Tokens.radius.sm,
  md: Tokens.radius.md,
  lg: Tokens.radius.lg,
  xl: 20,
  '2xl': Tokens.radius.xl,
  '3xl': 28,
  full: Tokens.radius.pill,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

export default Spacing;
