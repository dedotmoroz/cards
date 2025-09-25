import { User } from '../../domain/user';
import { UserRepository } from '../../ports/user-repository';
import { randomUUID } from 'crypto';
import { db } from '../../db/db';
import { eq, and } from 'drizzle-orm';
import { users } from '../../db/schema'; // schema.ts должен экспортировать `users`

export class PostgresUserRepository implements UserRepository {
    async create(user: Omit<User, 'id'>): Promise<User> {
        const id = randomUUID();
        await db.insert(users).values({
            id,
            email: user.email,
            password_hash: user.passwordHash,
        });
        return { id, ...user };
    }


    async findByEmail(email: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        const row = result[0];
        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            name: row.name ?? undefined,
            createdAt: row.created_at,
            oauthProvider: row.oauth_provider || undefined,
            oauthId: row.oauth_id ?? undefined,
        };
    }


    async findById(id: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, id));

        const row = result[0];
        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            name: row.name ?? undefined,
            createdAt: row.created_at,
            oauthProvider: row.oauth_provider ?? undefined,
            oauthId: row.oauth_id ?? undefined,
        };
    }

    async findByOAuth(provider: string, oauthId: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.oauth_provider, provider),
                    eq(users.oauth_id, oauthId)
                )
            );

        const row = result[0];
        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            name: row.name ?? undefined,
            createdAt: row.created_at,
            oauthProvider: row.oauth_provider ?? undefined,
            oauthId: row.oauth_id ?? undefined,
        };
    }
}