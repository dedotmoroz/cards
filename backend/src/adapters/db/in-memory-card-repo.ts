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

    async findAll(folderId: string): Promise<Card[]> {
        return this.cards.filter(card => card.folderId === folderId);
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
}
