export const APP_LANGUAGE_OPTIONS = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'uk', label: 'Українська' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'pl', label: 'Polski' },
    { code: 'pt', label: 'Português' },
    { code: 'zh', label: '中文' },
] as const;

export type AppLanguageCode = (typeof APP_LANGUAGE_OPTIONS)[number]['code'];
