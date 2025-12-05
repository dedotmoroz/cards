import { createTheme } from '@mui/material/styles';

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

export const theme = createTheme({
  palette: {
    background: {
      default: 'linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 50%, #FDF2F8 100%)',
      // paper: 'transparent',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    button: {
      bg: 'rgba(17, 24, 39, 0.8)',
      hover: 'rgba(17, 24, 39, 0.9)',
      disabled: '#030213',
      text: '#ffffff',
    },
  },

    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.4) 0%, rgba(250, 245, 255, 0.4) 50%, rgba(253, 242, 248, 0.4) 100%)', // полупрозрачный градиент
                    backdropFilter: 'blur(20px)',                // стеклянный эффект
                    boxShadow: 'none',                           // убираем тень
                    borderBottom: '1px solid rgba(255, 255, 255, 0.3)', // тонкая стеклянная граница
                },
            },
        },
    },

});

