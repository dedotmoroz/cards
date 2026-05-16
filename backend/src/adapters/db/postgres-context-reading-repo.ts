import { eq, and } from 'drizzle-orm';
import { db } from '../../db/db';
import { cards, contextReadingStates } from '../../db/schema';
import { toCard } from './mappers/toCard';
import { Card } from '../../domain/card';
import { ContextReadingState } from '../../domain/context-reading';
import { CardRepository, ContextReadingStateRepository } from '../../ports/context-reading-repository';

export class PostgresContextReadingCardRepository
    implements CardRepository {

    async findByFolderForContext(
        _userId: string,
        folderId: string,
        onlyUnlearned: boolean
    ): Promise<Card[]> {
        const condition = onlyUnlearned
            ? and(eq(cards.folderId, folderId), eq(cards.isLearned, false))
            : eq(cards.folderId, folderId);

        const rows = await db.select().from(cards).where(condition);
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
            row.updatedAt,
            row.onlyUnlearned
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
                onlyUnlearned: state.onlyUnlearned,
            })
            .onConflictDoUpdate({
                target: [
                    contextReadingStates.userId,
                    contextReadingStates.folderId,
                ],
                set: {
                    usedCardIds: state.usedCardIds,
                    updatedAt: state.updatedAt,
                    onlyUnlearned: state.onlyUnlearned,
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

    async deleteByUserId(userId: string, executor: any = db): Promise<void> {
        await executor
            .delete(contextReadingStates)
            .where(eq(contextReadingStates.userId, userId));
    }
}
