import { APP_LANGUAGE_OPTIONS } from '../constants/languages';

export function normalizeLanguageCode(language: string): string {
    const code = language.split('-')[0]?.toLowerCase() ?? language;
    const supported = APP_LANGUAGE_OPTIONS.some((l) => l.code === code);
    return supported ? code : 'en';
}

export function getDefaultSideALanguage(uiLanguage: string): string {
    const code = normalizeLanguageCode(uiLanguage);
    return code === 'en' ? 'es' : 'en';
}

export function getDefaultSideBLanguage(uiLanguage: string): string {
    return normalizeLanguageCode(uiLanguage);
}

export function formatLanguagePairLabel(source: string, target: string): string {
    return `${source.toUpperCase()} → ${target.toUpperCase()}`;
}

export function formatLanguageCodeLabel(code: string): string {
    const normalized = code.split('-')[0]?.toLowerCase() ?? code;
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function canRequestTranslation(
    sourceLang?: string,
    targetLang?: string
): boolean {
    if (!sourceLang || !targetLang) {
        return false;
    }
    return sourceLang !== targetLang;
}
