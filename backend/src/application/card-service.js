import { Card } from '../domain/card.js';
export class CardService {
    cardRepo;
    constructor(cardRepo) {
        this.cardRepo = cardRepo;
    }
    async createCard(userId, folderId, question, answer) {
        const id = crypto.randomUUID();
        const card = new Card(id, folderId, question, answer);
        await this.cardRepo.save(card);
        return card;
    }
    async updateCard(id, updates) {
        const card = await this.cardRepo.findById(id);
        if (!card)
            return null;
        if (updates.question !== undefined)
            card.question = updates.question;
        if (updates.answer !== undefined)
            card.answer = updates.answer;
        await this.cardRepo.save(card);
        return card;
    }
    async deleteCard(id) {
        await this.cardRepo.delete(id);
    }
    async markAsLearned(id) {
        const card = await this.cardRepo.findById(id);
        if (!card)
            return;
        card.markAsLearned();
        await this.cardRepo.save(card);
    }
    async markAsUnlearned(id) {
        const card = await this.cardRepo.findById(id);
        if (!card)
            return;
        card.markAsUnlearned();
        await this.cardRepo.save(card);
    }
    async getAll(userId, folderId, filter) {
        return this.cardRepo.findAll(userId, folderId, filter);
    }
    async shuffle(userId, folderId, filter) {
        const cards = await this.cardRepo.findAll(userId, folderId, filter);
        return cards.sort(() => Math.random() - 0.5);
    }
}
