import { Semantic, Tokens } from './tokens';

export const FontFamily = {
  regular: `${Tokens.font.family}_400Regular`,
  medium: `${Tokens.font.family}_500Medium`,
  semibold: `${Tokens.font.family}_600SemiBold`,
  bold: `${Tokens.font.family}_700Bold`,
  extrabold: `${Tokens.font.family}_800ExtraBold`,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: Semantic.type.bodyMd.fontSize,
  base: Semantic.type.bodyLg.fontSize,
  lg: Semantic.type.titleMd.fontSize,
  xl: 22,
  '2xl': Semantic.type.headingMd.fontSize,
  '3xl': Semantic.type.displayLg.fontSize,
  '4xl': 40,
  '5xl': 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const Type = Semantic.type;

export default FontSize;
