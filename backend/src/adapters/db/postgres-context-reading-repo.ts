import { eq, and } from 'drizzle-orm';
import { db } from '../../db/db';
import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { cards } from '../../db/schema';
import { toCard } from './mappers/toCard';
import { ContextReadingState } from '../../domain/context-reading';
import { ContextReadingStateRepository } from '../../ports/context-reading-repository';

export const contextReadingStates = pgTable(
    'context_reading_states',
    {
        userId: uuid('user_id').notNull(),
        folderId: uuid('folder_id').notNull(),
        usedCardIds: uuid('used_card_ids').array().notNull(),
        updatedAt: timestamp('updated_at').notNull(),
    }
);

export class PostgresContextReadingCardRepository
    implements ContextReadingStateRepository {

    async findUnlearnedByFolder(
        userId: string,
        folderId: string
    ) {
        const rows = await db
            .select()
            .from(cards)
            .where(
                and(
                    eq(cards.folderId, folderId),
                    eq(cards.isLearned, false)
                )
            );
        return rows.map(toCard);
    }
}


export class PostgresContextReadingStateRepository
    implements ContextReadingStateRepository {

    async findByUserAndFolder(
        userId: string,
        folderId: string
    ): Promise<ContextReadingState | null> {
        const row = await db.query.contextReadingStates.findFirst({
            where: and(
                eq(contextReadingStates.userId, userId),
                eq(contextReadingStates.folderId, folderId)
            ),
        });

        if (!row) return null;

        return new ContextReadingState(
            row.userId,
            row.folderId,
            row.usedCardIds,
            row.updatedAt
        );
    }

    async save(state: ContextReadingState): Promise<void> {
        await db
            .insert(contextReadingStates)
            .values({
                userId: state.userId,
                folderId: state.folderId,
                usedCardIds: state.usedCardIds,
                updatedAt: state.updatedAt,
            })
            .onConflictDoUpdate({
                target: [
                    contextReadingStates.userId,
                    contextReadingStates.folderId,
                ],
                set: {
                    usedCardIds: state.usedCardIds,
                    updatedAt: state.updatedAt,
                },
            });
    }

    async reset(userId: string, folderId: string): Promise<void> {
        await db
            .delete(contextReadingStates)
            .where(
                and(
                    eq(contextReadingStates.userId, userId),
                    eq(contextReadingStates.folderId, folderId)
                )
            );
    }
}
