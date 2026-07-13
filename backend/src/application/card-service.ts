import {
  Card,
  ContextLimitReachedError,
  MAX_CARD_CONTEXTS,
} from '../domain/card';
import { CardRepository } from '../ports/card-repository';

export { ContextLimitReachedError, MAX_CARD_CONTEXTS };

export class CardService {
  constructor(private readonly cardRepo: CardRepository) {}

  async getById(id: string): Promise<Card | null> {
    return this.cardRepo.findById(id);
  }

  async createCard(
    folderId: string,
    question: string,
    answer: string,
    questionSentences?: string | null,
    answerSentences?: string | null
  ): Promise<Card> {
    const id = crypto.randomUUID();
    const card = new Card(
      id,
      folderId,
      question,
      answer,
      false,
      new Date(),
      null,
      null,
      null,
      0,
      0,
      0,
      0,
      0,
      2.5,
      null,
      0,
      null,
      null,
    );
    if (questionSentences || answerSentences) {
      card.replaceLegacySentences(
        questionSentences ?? null,
        answerSentences ?? null,
      );
    }
    await this.cardRepo.save(card);
    return card;
  }

  async updateCard(
    id: string,
    updates: {
      question?: string;
      answer?: string;
      questionSentences?: string | null;
      answerSentences?: string | null;
      activeContextId?: string | null;
    }
  ): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    if (updates.question !== undefined) card.question = updates.question;
    if (updates.answer !== undefined) card.answer = updates.answer;

    if (
      updates.questionSentences !== undefined ||
      updates.answerSentences !== undefined
    ) {
      const nextQuestion =
        updates.questionSentences !== undefined
          ? updates.questionSentences
          : card.questionSentences;
      const nextAnswer =
        updates.answerSentences !== undefined
          ? updates.answerSentences
          : card.answerSentences;
      card.replaceLegacySentences(nextQuestion, nextAnswer);
    }

    if (updates.activeContextId !== undefined && updates.activeContextId !== null) {
      card.setActiveContext(updates.activeContextId);
    }

    await this.cardRepo.save(card);
    return card;
  }

  async appendContext(
    id: string,
    input: { text: string; translation: string },
    options: { replaceOldest?: boolean } = {},
  ): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    card.appendContext(input, options);
    await this.cardRepo.save(card);
    return card;
  }

  async setActiveContext(id: string, contextId: string): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    card.setActiveContext(contextId);
    await this.cardRepo.save(card);
    return card;
  }

  async removeContext(id: string, contextId: string): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    card.removeContext(contextId);
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

  async setFolderLearnStatus(folderId: string, isLearned: boolean): Promise<number> {
    return this.cardRepo.updateLearnStatusByFolderId(folderId, isLearned);
  }

  async reviewCard(id: string, outcome: 'know' | 'dontknow'): Promise<Card | null> {
    const card = await this.cardRepo.findById(id);
    if (!card) return null;
    card.review(outcome);
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

  async searchCards(
    folderIds: string[],
    query: string,
    limit: number,
    offset: number
  ): Promise<Array<{ card: Card; folderName: string }>> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    return this.cardRepo.searchByFolderIds(folderIds, trimmed, limit, offset);
  }
}
