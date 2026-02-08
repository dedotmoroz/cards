import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { googleSheetsTokens } from '../../db/schema';
import type { GoogleSheetsTokensRepository, GoogleSheetsTokenRow } from '../../ports/google-sheets-tokens-repository';

export class PostgresGoogleSheetsTokensRepository implements GoogleSheetsTokensRepository {
    async findByUserId(userId: string): Promise<GoogleSheetsTokenRow | null> {
        const rows = await db
            .select()
            .from(googleSheetsTokens)
            .where(eq(googleSheetsTokens.user_id, userId));
        const row = rows[0];
        if (!row) return null;
        return {
            userId: row.user_id,
            accessToken: row.access_token,
            refreshToken: row.refresh_token,
            expiresAt: row.expires_at,
        };
    }

    async save(row: GoogleSheetsTokenRow): Promise<void> {
        await db
            .insert(googleSheetsTokens)
            .values({
                user_id: row.userId,
                access_token: row.accessToken,
                refresh_token: row.refreshToken,
                expires_at: row.expiresAt,
            })
            .onConflictDoUpdate({
                target: [googleSheetsTokens.user_id],
                set: {
                    access_token: row.accessToken,
                    refresh_token: row.refreshToken ?? undefined,
                    expires_at: row.expiresAt,
                },
            });
    }

    async deleteByUserId(userId: string): Promise<void> {
        await db.delete(googleSheetsTokens).where(eq(googleSheetsTokens.user_id, userId));
    }
}
