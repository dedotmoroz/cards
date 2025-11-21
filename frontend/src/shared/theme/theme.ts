import { createTheme } from '@mui/material/styles';

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
  },

    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.4)', // полупрозрачный фон
                    backdropFilter: 'blur(20px)',                // стеклянный эффект
                    boxShadow: 'none',                           // убираем тень
                    borderBottom: '1px solid rgba(255, 255, 255, 0.3)', // тонкая стеклянная граница
                },
            },
        },
    },

});

