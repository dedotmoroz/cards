import { FOLDER_SIDE_B_LANGUAGE_CODES } from '../constants/languages';

export function normalizeLanguageCode(language: string): string {
    const code = language.split('-')[0]?.toLowerCase() ?? language;
    const supported = (FOLDER_SIDE_B_LANGUAGE_CODES as readonly string[]).includes(code);
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

/** Short code for column headers, e.g. "ja", "ru". */
export function formatLanguageCodeLabel(code: string): string {
    return code.split('-')[0]?.toLowerCase() ?? code;
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
