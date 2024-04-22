import type { ConfigBase } from 'unocss';

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

export const theme: ConfigBase['theme'] = {
  colors: {
    ...BASE_COLORS,
    panelBorder: BASE_COLORS.gray[200],
    editor: {
      light: {
        background: BASE_COLORS.white,
        cursor: {
          background: BASE_COLORS.black,
          width: '2px',
        },
        activeLine: 'rgb(222 222 222 / 40%)',
        selection: '#42B4FF',
        gutter: {
          foreground: '#237893',
        },
      },
      dark: {
        // TODO
      },
    },
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
};
