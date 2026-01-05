import { and, eq, isNull, gt } from 'drizzle-orm';
import { db } from '../../db/db';
import { telegramAuthNonce } from '../../db/schema';
import {
    TelegramNonceRepository,
    TelegramAuthNonce,
} from '../../ports/telegram-nonce-repository';


export class PostgresTelegramNonceRepository
    implements TelegramNonceRepository
{
    async save(nonce: TelegramAuthNonce): Promise<void> {
        await db.insert(telegramAuthNonce).values({
            nonce: nonce.nonce,
            telegramUserId: nonce.telegramUserId,
            expiresAt: nonce.expiresAt,
            usedAt: nonce.usedAt,
        });
    }

    async findByNonce(nonce: string): Promise<TelegramAuthNonce | null> {
        const row = await db.query.telegramAuthNonce.findFirst({
            where: eq(telegramAuthNonce.nonce, nonce),
        });

        if (!row) return null;

        return {
            nonce: row.nonce,
            telegramUserId: Number(row.telegramUserId),
            expiresAt: row.expiresAt,
            usedAt: row.usedAt,
        };
    }

    /**
     * Атомарно:
     * - nonce существует
     * - не использован
     * - не истёк
     */
    async markUsed(nonce: string): Promise<boolean> {
        const rows = await db
            .update(telegramAuthNonce)
            .set({
                usedAt: new Date(),
            })
            .where(
                and(
                    eq(telegramAuthNonce.nonce, nonce),
                    isNull(telegramAuthNonce.usedAt),
                    gt(telegramAuthNonce.expiresAt, new Date())
                )
            )
            .returning({ nonce: telegramAuthNonce.nonce });

        return rows.length === 1;
    }
}