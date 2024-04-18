import { defineConfig, presetIcons, presetUno } from 'unocss';

const BASE_COLORS = {
  white: '#FFFFFF',
  black: '#040407',
  primary: {
    DEFAULT: '#2BA6FF',
    50: '#EEF9FF',
    100: '#D8F1FF',
    200: '#BAE7FF',
    300: '#8ADAFF',
    400: '#53C4FF',
    500: '#2BA6FF',
    600: '#1488FC',
    700: '#0D6FE8',
    800: '#1259BB',
    900: '#154E93',
    950: '#122F59',
  },
  gray: {
    DEFAULT: '#6C737F',
    25: '#FCFCFD',
    50: '#F5F6F6',
    100: '#E4E6E9',
    200: '#CDD0D4',
    300: '#AAAFB6',
    400: '#7F8591',
    500: '#6C737F',
    600: '#565A64',
    700: '#494C55',
    800: '#414349',
    900: '#393B40',
    950: '#232429',
  },
};

export default defineConfig({
  shortcuts: {
    'panel-container': 'grid grid-rows-[min-content_1fr] h-full',
    'panel-header': 'flex gap-2 items-center p-1.5 pl-3 bg-gray-50',
    'panel-icon-size': 'text-5',
  },
  presets: [presetUno(), presetIcons()],
  theme: {
    colors: {
      ...BASE_COLORS,
      divider: '#8882',
      borderGray: BASE_COLORS.gray[200],
      callout: {
        tip: {
          border: '#BB3DF5',
          bg: '#EBC5fC',
          text: '#660891',
        },
        info: {
          border: BASE_COLORS.primary.DEFAULT,
          bg: BASE_COLORS.primary[100],
          text: BASE_COLORS.primary[900],
        },
        warn: {
          border: '#F5BB3D',
          bg: '#FCEAC5',
          text: '#73520D',
        },
      },
    },
  },
});
