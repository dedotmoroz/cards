import { randomBytes } from 'crypto';
import { TelegramNonceRepository } from '../ports/telegram-nonce-repository';
import { ExternalAccountService } from './external-account-service';

export class InvalidOrExpiredNonceError extends Error {
    constructor() {
        super('Invalid or expired nonce');
        this.name = 'InvalidOrExpiredNonceError';
    }
}

export class TelegramAuthService {
    private readonly NONCE_TTL_MS = 5 * 60 * 1000; // 5 минут

    constructor(
        private readonly nonceRepository: TelegramNonceRepository,
        private readonly externalAccountService: ExternalAccountService
    ) {}

    /**
     * Создание одноразового nonce для Telegram user
     */
    async createNonce(telegramUserId: number): Promise<{ nonce: string }> {
        const nonce = randomBytes(32).toString('base64url');

        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.NONCE_TTL_MS);

        await this.nonceRepository.save({
            nonce,
            telegramUserId,
            expiresAt,
            usedAt: null,
        });

        return { nonce };
    }

    /**
     * Привязка Telegram ↔ User по nonce
     */
    async bindByNonce(params: {
        nonce: string;
        userId: string;
    }): Promise<void> {
        const { nonce, userId } = params;

        const record = await this.nonceRepository.findByNonce(nonce);

        // 1️⃣ nonce существует?
        if (!record) {
            throw new InvalidOrExpiredNonceError();
        }

        // 2️⃣ не использован?
        if (record.usedAt) {
            throw new InvalidOrExpiredNonceError();
        }

        // 3️⃣ не протух?
        if (record.expiresAt.getTime() < Date.now()) {
            throw new InvalidOrExpiredNonceError();
        }

        // 4️⃣ помечаем как использованный (атомарно)
        const marked = await this.nonceRepository.markUsed(nonce);
        if (!marked) {
            throw new InvalidOrExpiredNonceError();
        }

        // 5️⃣ domain-bind
        await this.externalAccountService.bindExternalAccount({
            provider: 'telegram',
            externalId: String(record.telegramUserId),
            userId,
        });
    }
}