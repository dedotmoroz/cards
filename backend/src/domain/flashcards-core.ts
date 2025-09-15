/*
  Hexagonal Architecture — Core Layer for FlashCardsApp
  This code defines the domain model, services, and interfaces (ports)
  Тесты для этой логики можно писать с использованием Jest или любого другого фреймворка
*/

// Card — доменная сущность, описывающая карточку для изучения
export class Card {
    constructor(
        public readonly id: string,
        public readonly folderId: string,
        public question: string,
        public answer: string,
        public isLearned: boolean = false
    ) {}

    markAsLearned(): void {
        this.isLearned = true;
    }

    markAsUnlearned(): void {
        this.isLearned = false;
    }
}

// Folder — доменная сущность, представляющая папку (набор карточек)
export class Folder {
    constructor(
        public readonly id: string,
        public name: string,
        public readonly userId: string
    ) {}
}

// CardRepository — порт (интерфейс) хранилища карточек
export interface CardRepository {
    save(card: Card): Promise<void>;
    findById(id: string): Promise<Card | null>;
    findAll(userId: string, folderId?: string, filter?: { isLearned?: boolean }): Promise<Card[]>;
    delete(id: string): Promise<void>;
}

// FolderRepository — порт (интерфейс) хранилища папок
export interface FolderRepository {
    save(folder: Folder): Promise<void>;
    findById(id: string): Promise<Folder | null>;
    findAll(userId: string): Promise<Folder[]>;
    delete(id: string): Promise<void>;
}

// CardService — сервис бизнес-логики по работе с карточками
export class CardService {
    constructor(private readonly cardRepo: CardRepository) {}

    async createCard(
        userId: string,
        folderId: string,
        question: string,
        answer: string
    ): Promise<Card> {
        const id = crypto.randomUUID();
        const card = new Card(id, folderId, question, answer);
        await this.cardRepo.save(card);
        return card;
    }

    async updateCard(
        id: string,
        updates: { question?: string; answer?: string }
    ): Promise<Card | null> {
        const card = await this.cardRepo.findById(id);
        if (!card) return null;
        if (updates.question !== undefined) card.question = updates.question;
        if (updates.answer !== undefined) card.answer = updates.answer;
        await this.cardRepo.save(card);
        return card;
    }

    async deleteCard(id: string): Promise<void> {
        await this.cardRepo.delete(id);
    }

    async markAsLearned(id: string): Promise<void> {
        const card = await this.cardRepo.findById(id);
        if (!card) return;
        card.markAsLearned();
        await this.cardRepo.save(card);
    }

    async markAsUnlearned(id: string): Promise<void> {
        const card = await this.cardRepo.findById(id);
        if (!card) return;
        card.markAsUnlearned();
        await this.cardRepo.save(card);
    }

    async getAll(userId: string, folderId?: string, filter?: { isLearned?: boolean }) {
        return this.cardRepo.findAll(userId, folderId, filter);
    }

    async shuffle(userId: string, folderId?: string, filter?: { isLearned?: boolean }) {
        const cards = await this.cardRepo.findAll(userId, folderId, filter);
        return cards.sort(() => Math.random() - 0.5);
    }
}

// FolderService — сервис бизнес-логики по работе с папками (наборами карточек)
export class FolderService {
    constructor(private readonly folderRepo: FolderRepository) {}

    async createFolder(userId: string, name: string): Promise<Folder> {
        const id = crypto.randomUUID();
        const folder = new Folder(id, name, userId);
        await this.folderRepo.save(folder);
        return folder;
    }

    async renameFolder(id: string, newName: string): Promise<Folder | null> {
        const folder = await this.folderRepo.findById(id);
        if (!folder) return null;
        folder.name = newName;
        await this.folderRepo.save(folder);
        return folder;
    }

    async deleteFolder(id: string): Promise<void> {
        await this.folderRepo.delete(id);
    }

    async getAll(userId: string): Promise<Folder[]> {
        return this.folderRepo.findAll(userId);
    }
}

