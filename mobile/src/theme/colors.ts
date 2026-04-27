import { Semantic, Tokens } from './tokens';

const Colors = {
  primary: Semantic.color.action.primary,
  primaryLight: Tokens.color.green[400],
  primaryDark: Semantic.color.action.primaryPressed,
  primaryGradientStart: Tokens.color.green[800],
  primaryGradientEnd: Tokens.color.brand.base,
  brand: Semantic.color.action.brand,

  white: '#FFFFFF',
  offWhite: Semantic.color.bg.canvas,
  surfaceLight: Semantic.color.bg.surfaceAlt,
  background: Semantic.color.bg.canvas,
  border: Semantic.color.border.subtle,
  borderFocus: Semantic.color.action.primary,
  borderDefault: Semantic.color.border.default,

  textPrimary: Semantic.color.text.primary,
  textSecondary: Semantic.color.text.secondary,
  textMuted: Semantic.color.text.muted,
  textInverse: Semantic.color.text.inverse,

  error: Tokens.color.status.error,
  errorLight: Tokens.color.status.errorBg,
  errorBorder: Tokens.color.status.error,
  warning: Tokens.color.status.warning,
  warningLight: Tokens.color.status.warningBg,
  warningBorder: Tokens.color.status.warning,
  success: Semantic.color.action.primary,
  successLight: Tokens.color.status.successBg,
  info: Tokens.color.status.info,
  infoLight: Tokens.color.status.infoBg,

  recyclable: '#1565C0',
  recyclableBg: '#E3F2FD',
  organic: '#5D4037',
  organicBg: '#EFEBE9',
  hazardous: '#E65100',
  hazardousBg: '#FFF3E0',
  general: '#546E7A',
  generalBg: '#ECEFF1',

  confidenceHigh: Semantic.color.action.primary,
  confidenceHighBg: Tokens.color.status.successBg,
  confidenceMedium: Tokens.color.status.warning,
  confidenceMediumBg: Tokens.color.status.warningBg,
  confidenceLow: Tokens.color.status.error,
  confidenceLowBg: Tokens.color.status.errorBg,

  earn: Semantic.color.action.primary,
  spend: Tokens.color.status.error,

  google: '#DB4437',
  facebook: '#1877F2',
};

export default Colors;
