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
            name: user.name,
            language: user.language,
            is_guest: user.isGuest,
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
            language: row.language ?? undefined,
            isGuest: row.is_guest ?? undefined,
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
            language: row.language ?? undefined,
            isGuest: row.is_guest ?? undefined,
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
            language: row.language ?? undefined,
            isGuest: row.is_guest ?? undefined,
        };
    }

    async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
        const updateData: any = {};
        
        if (updates.email !== undefined) {
            updateData.email = updates.email;
        }
        if (updates.passwordHash !== undefined) {
            updateData.password_hash = updates.passwordHash;
        }
        if (updates.name !== undefined) {
            updateData.name = updates.name;
        }
        if (updates.oauthProvider !== undefined) {
            updateData.oauth_provider = updates.oauthProvider;
        }
        if (updates.oauthId !== undefined) {
            updateData.oauth_id = updates.oauthId;
        }
        if (updates.language !== undefined) {
            updateData.language = updates.language;
        }
        if (updates.isGuest !== undefined) {
            updateData.is_guest = updates.isGuest;
        }

        await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id));

        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new Error(`User with id ${id} not found after update`);
        }

        return updatedUser;
    }
}