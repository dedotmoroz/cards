import { env } from '../config/env';

type RequestOptions = {
    method?: 'GET' | 'POST';
    body?: unknown;
    telegramUserId: number;
};

async function request<T>(
    path: string,
    options: RequestOptions
): Promise<T> {
    const res = await fetch(`${env.API_URL}${path}`, {
        method: options.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.BOT_SERVICE_JWT}`,
            'X-Telegram-User-Id': String(options.telegramUserId),
        },
        body: options.body
            ? JSON.stringify(options.body)
            : undefined,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(
            `API ${res.status} ${path}: ${text}`
        );
    }

    return res.json() as Promise<T>;
}

// ===== Public API =====

export const apiClient = {

    /**
     * Проверка авторизации
     */
    telegramMe(telegramUserId: number) {
        return request<{
            linked: boolean;
            userId?: string;
            name?: string | null;
        }>('/telegram/me', {
            telegramUserId,
        });
    },

    /**
     * Получение nonce
     */
    telegramAuthNonce(telegramUserId: number) {
        return request<{ nonce: string }>(
            '/telegram/auth/nonce',
            {
                method: 'POST',
                telegramUserId,
                body: { telegramUserId },
            }
        );
    },

    /**
     * Получение списка папок
     */
    telegramFolders(telegramUserId: number) {
        return request<
            { id: string; name: string }[]
        >('/telegram/folders', {
            telegramUserId,
        });
    },

    /**
     * Получение следующей порции слов для контекста.
     */
    telegramContextNext(
        telegramUserId: number,
        folderId: string
    ) {
        return request<{
            text: string;
            translation: string;
            completed: boolean;
        }>('/telegram/context/next', {
            method: 'POST',
            telegramUserId,
            body: {
                telegramUserId,
                folderId,
            },
        });
    }
};