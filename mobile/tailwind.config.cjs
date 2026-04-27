/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // Bật hỗ trợ Dark Mode qua class
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Màu gốc tĩnh (không đổi theo theme)
        brand: {
          DEFAULT: '#358C5B',
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
        base: {
          canvas: '#FCFBFA',
          dark: '#141514',
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
        
        // Màu Semantic Động (Sẽ TỰ ĐỘNG THAY ĐỔI giữa sáng và tối)
        primary: {
          DEFAULT: 'var(--color-primary)',
          pressed: 'var(--color-primary-pressed)',
        },
        canvas: 'var(--color-canvas)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        }
      },
      fontFamily: {
        regular: ['BeVietnamPro_400Regular'],
        medium: ['BeVietnamPro_500Medium'],
        semibold: ['BeVietnamPro_600SemiBold'],
        bold: ['BeVietnamPro_700Bold'],
        extrabold: ['BeVietnamPro_800ExtraBold'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '999px',
      }
    },
  },
  plugins: [],
};
