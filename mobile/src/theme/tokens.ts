export const Tokens = {
  color: {
    brand: {
      base: '#358C5B',
    },
    base: {
      canvas: '#FCFBFA',
      dark: '#141514',
    },
    green: {
      100: '#DAEDD5',
      200: '#B8D6B0',
      300: '#BCDBB4',
      400: '#79B669',
      primary: '#1F8505',
      600: '#155A03',
      700: '#104502',
      800: '#0B2E02',
    },
    gray: {
      100: '#E5E5E5',
      200: '#CECFCD',
      300: '#CBC8C8',
      400: '#AAAAAA',
      500: '#6E726E',
      600: '#3B3D3B',
    },
    status: {
      error: '#C62828',
      warning: '#A15C00',
      info: '#0B57D0',
      successBg: '#EAF7E7',
      errorBg: '#FDECEC',
      warningBg: '#FFF4D6',
      infoBg: '#EAF2FF',
    },
  },
  font: {
    family: 'BeVietnamPro',
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    12: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  motion: {
    fast: 100,
    standard: 180,
    slow: 240,
  },
} as const;

export const Semantic = {
  color: {
    bg: {
      canvas: Tokens.color.base.canvas,
      surface: Tokens.color.base.canvas,
      surfaceAlt: Tokens.color.green[100],
    },
    text: {
      primary: Tokens.color.base.dark,
      secondary: Tokens.color.gray[600],
      muted: Tokens.color.gray[500],
      inverse: Tokens.color.base.canvas,
    },
    action: {
      primary: Tokens.color.green.primary,
      primaryPressed: Tokens.color.green[600],
      brand: Tokens.color.brand.base,
    },
    border: {
      default: Tokens.color.gray[500],
      subtle: Tokens.color.gray[200],
    },
  },
  type: {
    displayLg: {
      fontFamily: `${Tokens.font.family}_700Bold`,
      fontWeight: '700' as const,
      fontSize: 32,
      lineHeight: 40,
    },
    headingLg: {
      fontFamily: `${Tokens.font.family}_700Bold`,
      fontWeight: '700' as const,
      fontSize: 28,
      lineHeight: 36,
    },
    headingMd: {
      fontFamily: `${Tokens.font.family}_700Bold`,
      fontWeight: '700' as const,
      fontSize: 24,
      lineHeight: 32,
    },
    titleLg: {
      fontFamily: `${Tokens.font.family}_600SemiBold`,
      fontWeight: '600' as const,
      fontSize: 20,
      lineHeight: 28,
    },
    titleMd: {
      fontFamily: `${Tokens.font.family}_600SemiBold`,
      fontWeight: '600' as const,
      fontSize: 18,
      lineHeight: 26,
    },
    bodyLg: {
      fontFamily: `${Tokens.font.family}_400Regular`,
      fontWeight: '400' as const,
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMd: {
      fontFamily: `${Tokens.font.family}_400Regular`,
      fontWeight: '400' as const,
      fontSize: 14,
      lineHeight: 20,
    },
    labelLg: {
      fontFamily: `${Tokens.font.family}_600SemiBold`,
      fontWeight: '600' as const,
      fontSize: 14,
      lineHeight: 20,
    },
    labelSm: {
      fontFamily: `${Tokens.font.family}_600SemiBold`,
      fontWeight: '600' as const,
      fontSize: 12,
      lineHeight: 16,
    },
  },
} as const;

export default Tokens;
