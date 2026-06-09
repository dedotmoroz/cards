import { describe, it, expect, vi } from 'vitest';
import { sortLanguageCodesByLabel } from '../../constants/languages';
import {
    canRequestTranslation,
    formatLanguagePairLabel,
    formatLanguageCodeLabel,
} from '../folder-languages';

describe('sortLanguageCodesByLabel', () => {
    it('sorts by localized label', () => {
        const t = vi.fn((key: string) => {
            const labels: Record<string, string> = {
                'folders.languageOptions.en': 'English',
                'folders.languageOptions.ru': 'Russian',
                'folders.languageOptions.de': 'German',
            };
            return labels[key] ?? key;
        }) as unknown as import('i18next').TFunction;

        expect(sortLanguageCodesByLabel(['ru', 'en', 'de'], t, 'en')).toEqual([
            'en',
            'de',
            'ru',
        ]);
    });
});

describe('formatLanguageCodeLabel', () => {
    it('returns lowercase language code for column headers', () => {
        expect(formatLanguageCodeLabel('ja')).toBe('ja');
        expect(formatLanguageCodeLabel('EN')).toBe('en');
        expect(formatLanguageCodeLabel('ru-RU')).toBe('ru');
    });
});

describe('formatLanguagePairLabel', () => {
    it('formats language codes as uppercase pair', () => {
        expect(formatLanguagePairLabel('en', 'ru')).toBe('EN → RU');
    });

    it('preserves multi-part codes in uppercase', () => {
        expect(formatLanguagePairLabel('zh', 'de')).toBe('ZH → DE');
    });
});

describe('canRequestTranslation', () => {
    it('returns true for different languages', () => {
        expect(canRequestTranslation('en', 'ru')).toBe(true);
    });

    it('returns false when source is missing', () => {
        expect(canRequestTranslation(undefined, 'ru')).toBe(false);
    });

    it('returns false when target is missing', () => {
        expect(canRequestTranslation('en', undefined)).toBe(false);
    });

    it('returns false when languages are the same', () => {
        expect(canRequestTranslation('en', 'en')).toBe(false);
    });
});
