import { eq } from 'drizzle-orm';
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
                folderId: card.folderId,
                isLearned: card.isLearned,
            }).where(eq(cards.id, card.id));
        } else {
            await db.insert(cards).values({
                id: card.id,
                question: card.question,
                answer: card.answer,
                folderId: card.folderId,
                isLearned: card.isLearned,
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
            .where(eq(cards.folderId, folderId));
        return rows.map(toCard);
    }

    async delete(id: string): Promise<void> {
        await db.delete(cards).where(eq(cards.id, id));
    }
}