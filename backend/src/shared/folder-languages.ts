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

export const FOLDER_SIDE_A_EXTRA_LANGUAGE_CODES = [
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

export const FOLDER_SIDE_A_LANGUAGE_CODES = [
    ...FOLDER_SIDE_B_LANGUAGE_CODES,
    ...FOLDER_SIDE_A_EXTRA_LANGUAGE_CODES,
] as const;

/** @deprecated Use FOLDER_SIDE_B_LANGUAGE_CODES */
export const FOLDER_LANGUAGE_CODES = FOLDER_SIDE_B_LANGUAGE_CODES;

export type FolderSideBLanguageCode = (typeof FOLDER_SIDE_B_LANGUAGE_CODES)[number];
export type FolderSideALanguageCode = (typeof FOLDER_SIDE_A_LANGUAGE_CODES)[number];
export type FolderLanguageCode = FolderSideBLanguageCode;

export function isFolderSideBLanguageCode(value: string): value is FolderSideBLanguageCode {
    return (FOLDER_SIDE_B_LANGUAGE_CODES as readonly string[]).includes(value);
}

export function isFolderSideALanguageCode(value: string): value is FolderSideALanguageCode {
    return (FOLDER_SIDE_A_LANGUAGE_CODES as readonly string[]).includes(value);
}

/** @deprecated Use isFolderSideBLanguageCode */
export function isFolderLanguageCode(value: string): value is FolderLanguageCode {
    return isFolderSideBLanguageCode(value);
}
