const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResponse {
    success: boolean;
    'error-codes'?: string[];
}

/**
 * Проверяет токен Cloudflare Turnstile через siteverify API.
 * Возвращает true, если капча пройдена, иначе false.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret || !token.trim()) {
        return false;
    }

    try {
        const response = await fetch(TURNSTILE_VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, response: token }),
        });

        if (!response.ok) {
            return false;
        }

        const data = (await response.json()) as SiteverifyResponse;
        return data.success === true;
    } catch {
        return false;
    }
}
