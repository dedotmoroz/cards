import { eq, and } from 'drizzle-orm';
import { db } from '../../db/db';
import { externalAccounts } from '../../db/schema';
import { ExternalAccount, ExternalAccountProvider } from '../../domain/external-account';
import { ExternalAccountRepository } from '../../application/external-account-service';

export class PostgresExternalAccountRepository
    implements ExternalAccountRepository
{
    async findByProviderAndExternalId(
        provider: ExternalAccountProvider,
        externalId: string
    ): Promise<ExternalAccount | null> {
        const row = await db.query.externalAccounts.findFirst({
            where: and(
                eq(externalAccounts.provider, provider),
                eq(externalAccounts.externalId, externalId)
            ),
        });

        if (!row) return null;

        return new ExternalAccount({
            provider: row.provider as ExternalAccountProvider,
            externalId: row.externalId,
            userId: row.userId,
            createdAt: row.createdAt,
        });
    }

    async findByProviderAndUserId(
        provider: ExternalAccountProvider,
        userId: string
    ): Promise<ExternalAccount | null> {
        const row = await db.query.externalAccounts.findFirst({
            where: and(
                eq(externalAccounts.provider, provider),
                eq(externalAccounts.userId, userId)
            ),
        });

        if (!row) return null;

        return new ExternalAccount({
            provider: row.provider as ExternalAccountProvider,
            externalId: row.externalId,
            userId: row.userId,
            createdAt: row.createdAt,
        });
    }

    async save(account: ExternalAccount): Promise<void> {
        await db.insert(externalAccounts).values({
            provider: account.provider,
            externalId: account.externalId,
            userId: account.userId,
            createdAt: account.createdAt,
        });
    }
}