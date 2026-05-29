export const FOLDER_LANGUAGE_CODES = [
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

export type FolderLanguageCode = (typeof FOLDER_LANGUAGE_CODES)[number];

export function isFolderLanguageCode(value: string): value is FolderLanguageCode {
    return (FOLDER_LANGUAGE_CODES as readonly string[]).includes(value);
}
