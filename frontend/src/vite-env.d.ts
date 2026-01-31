/// <reference types="vite/client" />

interface Window {
  turnstile?: {
    render: (container: HTMLElement, options: { sitekey: string; callback?: (token: string) => void }) => string;
    remove: (widgetId: string) => void;
    getResponse: (widgetId: string) => string;
  };
}
