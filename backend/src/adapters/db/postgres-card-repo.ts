import { eq, desc, and, inArray, sql, or, ilike } from 'drizzle-orm';
import { db } from '../../db/db';
import { Card } from '../../domain/card';
import { CardRepository } from '../../ports/card-repository';
import { cards } from '../../db/schema';
import { toCard } from './mappers/toCard';

export class PostgresCardRepository implements CardRepository {
    async save(card: Card): Promise<void> {
        const existing = await db.query.cards.findFirst({
            where: eq(cards.id, card.id),
        });
        if (existing) {
            await db.update(cards).set({
                question: card.question,
                answer: card.answer,
                questionSentences: card.questionSentences,
                answerSentences: card.answerSentences,
                folderId: card.folderId,
                isLearned: card.isLearned,
                // Интервальное повторение
                lastShownAt: card.lastShownAt,
                lastLearnedAt: card.lastLearnedAt,
                nextReviewAt: card.nextReviewAt,
                // Статистика
                reviewCount: card.reviewCount,
                correctCount: card.correctCount,
                incorrectCount: card.incorrectCount,
                // SM-2
                currentInterval: card.currentInterval,
                repetitions: card.repetitions,
                easeFactor: card.easeFactor,
                lastRating: card.lastRating,
                averageRating: card.averageRating,
            }).where(eq(cards.id, card.id));
        } else {
            await db.insert(cards).values({
                id: card.id,
                question: card.question,
                answer: card.answer,
                questionSentences: card.questionSentences,
                answerSentences: card.answerSentences,
                folderId: card.folderId,
                isLearned: card.isLearned,
                createdAt: card.createdAt,
                // Интервальное повторение
                lastShownAt: card.lastShownAt,
                lastLearnedAt: card.lastLearnedAt,
                nextReviewAt: card.nextReviewAt,
                // Статистика
                reviewCount: card.reviewCount,
                correctCount: card.correctCount,
                incorrectCount: card.incorrectCount,
                // SM-2
                currentInterval: card.currentInterval,
                repetitions: card.repetitions,
                easeFactor: card.easeFactor,
                lastRating: card.lastRating,
                averageRating: card.averageRating,
            });
        }
    }

    async findById(id: string): Promise<Card | null> {
        const result = await db.query.cards.findFirst({
            where: eq(cards.id, id),
        });
        return result ? toCard(result) : null;
    }

    async findAll(folderId?: string, filter?: { isLearned?: boolean }): Promise<Card[]> {
        const whereParts = [];
        if (folderId) whereParts.push(eq(cards.folderId, folderId));
        if (filter?.isLearned !== undefined) whereParts.push(eq(cards.isLearned, filter.isLearned));

        const whereClause = whereParts.length ? and(...whereParts) : undefined;

        const rows = await db
            .select()
            .from(cards)
            .where(whereClause)
            .orderBy(desc(cards.createdAt));
        return rows.map(toCard);
    }

    async delete(id: string): Promise<void> {
        await db.delete(cards).where(eq(cards.id, id));
    }

    async deleteByFolderIds(folderIds: string[], executor: any = db): Promise<void> {
        if (folderIds.length === 0) return;
        await executor.delete(cards).where(inArray(cards.folderId, folderIds));
    }

    async countByFolderIds(folderIds: string[]): Promise<Record<string, number>> {
        if (folderIds.length === 0) return {};
        const rows = await db
            .select({
                folderId: cards.folderId,
                count: sql<number>`count(*)::int`,
            })
            .from(cards)
            .where(inArray(cards.folderId, folderIds))
            .groupBy(cards.folderId);
        return Object.fromEntries(rows.map((r) => [r.folderId, r.count]));
    }

    async findRememberCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]> {
        if (folderIds.length === 0) return [];
        const orderKey = sql<Date>`coalesce(${cards.lastLearnedAt}, ${cards.createdAt})`;
        const rows = await db
            .select()
            .from(cards)
            .where(inArray(cards.folderId, folderIds))
            .orderBy(orderKey)
            .limit(limit);
        return rows.map(toCard);
    }

    async findHardCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]> {
        if (folderIds.length === 0) return [];
        const rate = sql<number>`(${cards.incorrectCount}::float / nullif(${cards.reviewCount}, 0))`;
        const rows = await db
            .select()
            .from(cards)
            .where(
                and(
                    inArray(cards.folderId, folderIds),
                    eq(cards.isLearned, true),
                    sql`${cards.reviewCount} >= 2`
                )
            )
            .orderBy(sql`${rate} DESC`, cards.averageRating, desc(cards.reviewCount))
            .limit(limit);
        return rows.map(toCard);
    }

    async countHardCardsByFolderIds(folderIds: string[]): Promise<number> {
        if (folderIds.length === 0) return 0;
        const rows = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(cards)
            .where(
                and(
                    inArray(cards.folderId, folderIds),
                    eq(cards.isLearned, true),
                    sql`${cards.reviewCount} >= 2`
                )
            );
        return rows[0]?.count ?? 0;
    }

    async searchByFolderIds(
        folderIds: string[],
        query: string,
        limit: number,
        offset: number
    ): Promise<Array<{ card: Card; folderName: string }>> {
        if (folderIds.length === 0 || query.trim().length < 2) return [];

        const pattern = `%${query.trim().replace(/[%_\\]/g, '\\$&')}%`;
        const rows = await db
            .select()
            .from(cards)
            .where(
                and(
                    inArray(cards.folderId, folderIds),
                    or(
                        ilike(cards.question, pattern),
                        ilike(cards.answer, pattern)
                    )
                )
            )
            .orderBy(desc(cards.createdAt))
            .limit(limit)
            .offset(offset);

        return rows.map((row) => ({
            card: toCard(row),
            folderName: '',
        }));
    }
}