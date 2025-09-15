/*
  Hexagonal Architecture — Core Layer for FlashCardsApp
  This code defines the domain model, services, and interfaces (ports)
  Тесты для этой логики можно писать с использованием Jest или любого другого фреймворка
*/
// Card — доменная сущность, описывающая карточку для изучения
export class Card {
    id;
    folderId;
    question;
    answer;
    isLearned;
    constructor(id, folderId, question, answer, isLearned = false) {
        this.id = id;
        this.folderId = folderId;
        this.question = question;
        this.answer = answer;
        this.isLearned = isLearned;
    }
    markAsLearned() {
        this.isLearned = true;
    }
    markAsUnlearned() {
        this.isLearned = false;
    }
}
// Folder — доменная сущность, представляющая папку (набор карточек)
export class Folder {
    id;
    name;
    userId;
    constructor(id, name, userId) {
        this.id = id;
        this.name = name;
        this.userId = userId;
    }
}
// CardService — сервис бизнес-логики по работе с карточками
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
// FolderService — сервис бизнес-логики по работе с папками (наборами карточек)
export class FolderService {
    folderRepo;
    constructor(folderRepo) {
        this.folderRepo = folderRepo;
    }
    async createFolder(userId, name) {
        const id = crypto.randomUUID();
        const folder = new Folder(id, name, userId);
        await this.folderRepo.save(folder);
        return folder;
    }
    async renameFolder(id, newName) {
        const folder = await this.folderRepo.findById(id);
        if (!folder)
            return null;
        folder.name = newName;
        await this.folderRepo.save(folder);
        return folder;
    }
    async deleteFolder(id) {
        await this.folderRepo.delete(id);
    }
    async getAll(userId) {
        return this.folderRepo.findAll(userId);
    }
}
