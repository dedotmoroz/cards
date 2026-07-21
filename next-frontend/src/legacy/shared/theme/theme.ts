import { createTheme, type ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    button?: {
      bg: string;
      hover: string;
      disabled: string;
      text: string;
    };
  }

  interface PaletteOptions {
    button?: {
      bg: string;
      hover: string;
      disabled: string;
      text: string;
    };
  }
}

/**
 * MUI palette values must be parseable colors (#rgb / rgb() / hsl()).
 * CSS variables are fine in Emotion styled() and CSS modules, but not here —
 * MUI calls color manipulators (alpha, contrast) on palette entries.
 */
const sharedComponents: ThemeOptions['components'] = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: 'var(--bg-appbar)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'none',
        borderBottom: '1px solid var(--border-glass)',
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 50%, #FDF2F8 100%)',
      paper: '#ffffff',
    },
    primary: {
      main: '#615FFF',
    },
    secondary: {
      main: '#F6339A',
    },
    text: {
      primary: '#101828',
      secondary: '#4A5565',
    },
    divider: '#E5E7EB',
    error: {
      main: '#da4949',
    },
    success: {
      main: '#00C950',
    },
    button: {
      bg: 'rgba(17, 24, 39, 0.8)',
      hover: 'rgba(17, 24, 39, 0.9)',
      disabled: '#030213',
      text: '#ffffff',
    },
  },
  components: sharedComponents,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'linear-gradient(135deg,rgb(78, 7, 106),rgb(6, 110, 145) 60%,rgb(0, 126, 124) 100%)',
      paper: '#161622',
    },
    primary: {
      main: '#8B87FF',
    },
    secondary: {
      main: '#F472B6',
    },
    text: {
      primary: '#F4F4F7',
      secondary: '#A1A1B5',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    error: {
      main: '#da4949',
    },
    success: {
      main: '#00C950',
    },
    button: {
      bg: 'rgba(255, 255, 255, 0.9)',
      hover: '#ffffff',
      disabled: '#2a2a3a',
      text: '#101828',
    },
  },
  components: sharedComponents,
});

/** @deprecated Prefer lightTheme / darkTheme via theme store */
export const theme = lightTheme;
