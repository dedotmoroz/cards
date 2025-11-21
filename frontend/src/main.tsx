import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { GlobalStyles } from '@mui/material'

import App from '@/app/app';
import '@/i18n'; // Initialize i18n
import { theme } from '@/shared/theme/theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            background: theme.palette.background.default,
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
          },
        }}
      />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
