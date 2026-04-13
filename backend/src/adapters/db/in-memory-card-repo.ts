import { CardRepository } from '../../ports/card-repository';
import { Card } from '../../domain/card';

export class InMemoryCardRepository implements CardRepository {
    private cards: Card[] = [];

    async save(card: Card): Promise<void> {
        const index = this.cards.findIndex(c => c.id === card.id);
        if (index >= 0) this.cards[index] = card;
        else this.cards.push(card);
    }

    async findById(id: string): Promise<Card | null> {
        const card = this.cards.find(card => card.id === id);
        return card ?? null;
    }

    async findAll(folderId?: string, filter?: { isLearned?: boolean }): Promise<Card[]> {
        let result = this.cards;
        if (folderId) {
            result = result.filter((card) => card.folderId === folderId);
        }
        if (filter?.isLearned !== undefined) {
            result = result.filter((card) => card.isLearned === filter.isLearned);
        }
        return result;
    }

    async delete(id: string): Promise<void> {
        this.cards = this.cards.filter(card => card.id !== id);
    }

    async countByFolderIds(folderIds: string[]): Promise<Record<string, number>> {
        const result: Record<string, number> = {};
        for (const fid of folderIds) {
            result[fid] = 0;
        }
        for (const card of this.cards) {
            if (folderIds.includes(card.folderId)) {
                result[card.folderId] = (result[card.folderId] ?? 0) + 1;
            }
        }
        return result;
    }

    async findRememberCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]> {
        return this.cards
            .filter((c) => folderIds.includes(c.folderId))
            .sort((a, b) => {
                const aKey = (a.lastLearnedAt ?? a.createdAt).getTime();
                const bKey = (b.lastLearnedAt ?? b.createdAt).getTime();
                return aKey - bKey;
            })
            .slice(0, limit);
    }

    async findHardCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]> {
        const errorRate = (c: Card) => {
            const denom = c.reviewCount || 0;
            return denom > 0 ? c.incorrectCount / denom : 0;
        };
        return this.cards
            .filter((c) => folderIds.includes(c.folderId))
            .filter((c) => c.isLearned)
            .filter((c) => c.reviewCount >= 2)
            .sort((a, b) => {
                const byRate = errorRate(b) - errorRate(a);
                if (byRate !== 0) return byRate;
                const byAvg = a.averageRating - b.averageRating;
                if (byAvg !== 0) return byAvg;
                return b.reviewCount - a.reviewCount;
            })
            .slice(0, limit);
    }

    async countHardCardsByFolderIds(folderIds: string[]): Promise<number> {
        if (folderIds.length === 0) return 0;
        return this.cards.filter(
            (c) =>
                folderIds.includes(c.folderId) &&
                c.isLearned &&
                c.reviewCount >= 2
        ).length;
    }
}
