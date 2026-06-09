import type { TFunction } from 'i18next';

export const FOLDER_SIDE_B_LANGUAGE_CODES = [
    'ru',
    'en',
    'uk',
    'de',
    'es',
    'fr',
    'pl',
    'pt',
    'zh',
] as const;

export const SIDE_A_EXTRA_LANGUAGE_CODES = [
    'ja',
    'ko',
    'it',
    'nl',
    'tr',
    'sv',
    'no',
    'da',
    'fi',
    'cs',
    'hu',
    'ro',
    'el',
    'th',
    'vi',
    'ar',
    'he',
    'fa',
] as const;

export const SIDE_A_LANGUAGE_CODES = [
    ...FOLDER_SIDE_B_LANGUAGE_CODES,
    ...SIDE_A_EXTRA_LANGUAGE_CODES,
] as const;

export type AppLanguageCode = (typeof FOLDER_SIDE_B_LANGUAGE_CODES)[number];

/** UI app language + folder side B options (codes only; labels via i18n). */
export const APP_LANGUAGE_OPTIONS = FOLDER_SIDE_B_LANGUAGE_CODES.map((code) => ({ code }));

export function getFolderLanguageLabel(code: string, t: TFunction): string {
    const normalized = code.split('-')[0]?.toLowerCase() ?? code;
    return t(`folders.languageOptions.${normalized}`, { defaultValue: normalized });
}

/** Sort language codes by localized label for the current UI locale. */
export function sortLanguageCodesByLabel(
    codes: readonly string[],
    t: TFunction,
    locale?: string,
): string[] {
    return [...codes].sort((a, b) =>
        getFolderLanguageLabel(a, t).localeCompare(
            getFolderLanguageLabel(b, t),
            locale,
            { sensitivity: 'base' },
        ),
    );
}
