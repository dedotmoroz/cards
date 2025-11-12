import { eq, desc } from 'drizzle-orm';
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

    async findAll(folderId: string): Promise<Card[]> {
        const rows = await db
            .select()
            .from(cards)
            .where(eq(cards.folderId, folderId))
            .orderBy(desc(cards.createdAt));
        return rows.map(toCard);
    }

    async delete(id: string): Promise<void> {
        await db.delete(cards).where(eq(cards.id, id));
    }
}