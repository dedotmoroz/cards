import { CardService } from '../application/card-service';
import { Card } from '../domain/card';
import { CardRepository } from '../ports/card-repository';

const createMockRepo = (): jest.Mocked<CardRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
});

describe('CardService', () => {
    let repo: jest.Mocked<CardRepository>;
    let service: CardService;

    beforeEach(() => {
        repo = createMockRepo();
        service = new CardService(repo);
    });

    it('создает карточку', async () => {
        const card = await service.createCard('folder1', 'Q', 'A');

        expect(card.folderId).toBe('folder1');
        expect(card.question).toBe('Q');
        expect(card.answer).toBe('A');
        expect(card.createdAt).toBeInstanceOf(Date);
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('обновляет карточку', async () => {
        const card = new Card('id123', 'folder1', 'Old Q', 'Old A', false, new Date());
        repo.findById.mockResolvedValue(card);

        const updated = await service.updateCard('id123', { question: 'New Q', answer: 'New A' });

        expect(updated?.question).toBe('New Q');
        expect(updated?.answer).toBe('New A');
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('перемещает карточку в другую папку', async () => {
        const card = new Card('id123', 'oldFolder', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);

        const updated = await service.moveCardToFolder('id123', 'newFolder');

        expect(updated?.folderId).toBe('newFolder');
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('удаляет карточку', async () => {
        await service.deleteCard('id123');
        expect(repo.delete).toHaveBeenCalledWith('id123');
    });

    it('возвращает карточки по папке', async () => {
        const cards = [
            new Card('1', 'folder1', 'Q1', 'A1', false, new Date()),
            new Card('2', 'folder1', 'Q2', 'A2', false, new Date()),
        ];
        repo.findAll.mockResolvedValue(cards);

        const result = await service.getAll('folder1');
        expect(result).toEqual(cards);
    });

    it('помечает карточку как выученную', async () => {
        const card = new Card('1', 'folder1', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);

        const updated = await service.markAsLearned('1');

        expect(card.isLearned).toBe(true);
        expect(updated?.isLearned).toBe(true);
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('помечает карточку как невыученную', async () => {
        const card = new Card('1', 'folder1', 'Q', 'A', true, new Date());
        repo.findById.mockResolvedValue(card);

        const updated = await service.markAsUnlearned('1');

        expect(card.isLearned).toBe(false);
        expect(updated?.isLearned).toBe(false);
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('создает карточку с текущей датой', async () => {
        const before = new Date();
        const card = await service.createCard('folder1', 'Q', 'A');
        const after = new Date();

        expect(card.createdAt).toBeInstanceOf(Date);
        expect(card.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(card.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('отмечает карточку как показанную', async () => {
        const card = new Card('1', 'folder1', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);

        card.markAsShown();

        expect(card.lastShownAt).toBeInstanceOf(Date);
        expect(card.reviewCount).toBe(1);
    });

    it('записывает правильный ответ', async () => {
        const card = new Card('1', 'folder1', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);

        card.recordCorrect();

        expect(card.correctCount).toBe(1);
        expect(card.averageRating).toBe(5);
    });

    it('записывает неправильный ответ', async () => {
        const card = new Card('1', 'folder1', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);

        card.recordIncorrect();

        expect(card.incorrectCount).toBe(1);
        expect(card.averageRating).toBe(1);
    });

    it('возвращает только публичные поля для фронта', async () => {
        const card = new Card('1', 'folder1', 'Q', 'A', false, new Date());
        const publicDTO = card.toPublicDTO();

        expect(publicDTO).toEqual({
            id: '1',
            folderId: 'folder1',
            question: 'Q',
            answer: 'A',
            isLearned: false,
            createdAt: card.createdAt
        });
        expect(publicDTO).not.toHaveProperty('lastShownAt');
        expect(publicDTO).not.toHaveProperty('reviewCount');
    });
});