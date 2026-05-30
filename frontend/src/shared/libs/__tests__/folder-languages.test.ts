import { describe, it, expect } from 'vitest';
import {
    canRequestTranslation,
    formatLanguagePairLabel,
} from '../folder-languages';

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
