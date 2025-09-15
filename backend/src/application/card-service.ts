import { Card } from '../domain/card';
import { CardRepository } from '../ports/card-repository';

export class CardService {
  constructor(private readonly cardRepo: CardRepository) {}

  async createCard(folderId: string, question: string, answer: string): Promise<Card> {
    const id = crypto.randomUUID();
    const card = new Card(id, folderId, question, answer);
    await this.cardRepo.save(card);
    return card;
  }

  async updateCard(id: string, updates: { question?: string; answer?: string }): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    if (updates.question !== undefined) card.question = updates.question;
    if (updates.answer !== undefined) card.answer = updates.answer;
    await this.cardRepo.save(card);
    return card;
  }

  async moveCardToFolder(cardId: string, newFolderId: string): Promise<Card | null> {
    const card = await this.cardRepo.findById(cardId);
    if (!card) return null;
    card.folderId = newFolderId;
    await this.cardRepo.save(card);
    return card;
  }

  async deleteCard(id: string): Promise<void> {
    await this.cardRepo.delete(id);
  }

  async markAsLearned(id: string): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    card.markAsLearned();
    await this.cardRepo.save(card);
    return card;
  }

  async markAsUnlearned(id: string): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    card.markAsUnlearned();
    await this.cardRepo.save(card);
    return card;
  }

  async getAll(folderId?: string) {
    return this.cardRepo.findAll(folderId);
  }

  async shuffle(folderId?: string, filter?: { isLearned?: boolean }) {
    const cards = await this.cardRepo.findAll(folderId, filter);
    return cards.sort(() => Math.random() - 0.5);
  }
}
