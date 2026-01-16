/**
 * Google Translate API service
 */

const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

export interface TranslateOptions {
    text: string;
    targetLang: string;
    sourceLang?: string; // опционально, если не указан - автоопределение
}

export interface TranslateResponse {
    translatedText: string;
    detectedSourceLanguage?: string;
}

/**
 * Переводит текст используя Google Translate API
 */
export async function translateText(options: TranslateOptions): Promise<TranslateResponse> {
    const apiKey = process.env.GOOGLE_TRANSLATE;
    
    if (!apiKey) {
        throw new Error('GOOGLE_TRANSLATE API key is not configured');
    }

    const { text, targetLang, sourceLang } = options;

    if (!text || !text.trim()) {
        throw new Error('Text to translate is required');
    }

    if (!targetLang) {
        throw new Error('Target language is required');
    }

    const params = new URLSearchParams({
        key: apiKey,
        q: text,
        target: targetLang,
        format: 'text',
    });

    // Если указан исходный язык, добавляем его
    if (sourceLang) {
        params.append('source', sourceLang);
    }

    try {
        const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(
                `Google Translate API error: ${errorData.error?.message || response.statusText}`
            );
        }

        const data = await response.json();

        if (!data.data || !data.data.translations || data.data.translations.length === 0) {
            throw new Error('Invalid response from Google Translate API');
        }

        const translation = data.data.translations[0];

        return {
            translatedText: translation.translatedText,
            detectedSourceLanguage: translation.detectedSourceLanguage,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to translate text');
    }
}

/**
 * Маппинг языков из формата i18n в формат Google Translate
 */
export function mapLanguageToGoogleFormat(lang: string): string {
    const languageMap: Record<string, string> = {
        'en': 'en',
        'ru': 'ru',
        'uk': 'uk',
        'de': 'de',
        'es': 'es',
        'fr': 'fr',
        'pl': 'pl',
        'pt': 'pt',
        'zh': 'zh',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
    };

    return languageMap[lang] || lang;
}
