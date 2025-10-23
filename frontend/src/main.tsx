import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/app';
import '@/i18n'; // Initialize i18n

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
