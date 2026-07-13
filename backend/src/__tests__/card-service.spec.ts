import { CardService } from '../application/card-service';
import { Card } from '../domain/card';
import { CardRepository } from '../ports/card-repository';

const createMockRepo = (): jest.Mocked<CardRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    updateLearnStatusByFolderId: jest.fn().mockResolvedValue(0),
    delete: jest.fn(),
    deleteByFolderIds: jest.fn(),
    countByFolderIds: jest.fn().mockResolvedValue({}),
    findRememberCardsByFolderIds: jest.fn().mockResolvedValue([]),
    findHardCardsByFolderIds: jest.fn().mockResolvedValue([]),
    countHardCardsByFolderIds: jest.fn().mockResolvedValue(0),
    searchByFolderIds: jest.fn().mockResolvedValue([]),
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

    it('создает карточку с предложениями', async () => {
        const card = await service.createCard('folder1', 'Q', 'A', 'Q sentences', 'A sentences');

        expect(card.questionSentences).toBe('Q sentences');
        expect(card.answerSentences).toBe('A sentences');
        expect(card.contexts).toHaveLength(1);
        expect(card.contexts[0].text).toBe('Q sentences');
        expect(card.activeContextId).toBe(card.contexts[0].id);
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('обновляет карточку', async () => {
        const card = new Card('id123', 'folder1', 'Old Q', 'Old A', false, new Date());
        repo.findById.mockResolvedValue(card);

        const updated = await service.updateCard('id123', {
            question: 'New Q',
            answer: 'New A',
            questionSentences: 'New QS',
            answerSentences: 'New AS'
        });

        expect(updated?.question).toBe('New Q');
        expect(updated?.answer).toBe('New A');
        expect(updated?.questionSentences).toBe('New QS');
        expect(updated?.answerSentences).toBe('New AS');
        expect(updated?.contexts).toHaveLength(1);
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('очищает предложения карточки', async () => {
        const card = new Card('id123', 'folder1', 'Q', 'A', false, new Date());
        card.replaceLegacySentences('QS', 'AS');
        repo.findById.mockResolvedValue(card);

        const updated = await service.updateCard('id123', {
            questionSentences: null,
            answerSentences: null
        });

        expect(updated?.questionSentences).toBeNull();
        expect(updated?.answerSentences).toBeNull();
        expect(updated?.contexts).toHaveLength(0);
        expect(repo.save).toHaveBeenCalledWith(card);
    });

    it('добавляет контекст и заменяет самый старый при лимите', async () => {
        const card = new Card('id123', 'folder1', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);

        for (let i = 0; i < 5; i++) {
            await service.appendContext('id123', {
                text: `t${i}`,
                translation: `tr${i}`,
            });
        }
        expect(card.contexts).toHaveLength(5);
        const oldestId = card.contexts[0].id;

        await service.appendContext(
            'id123',
            { text: 'newest', translation: 'новый' },
            { replaceOldest: true },
        );

        expect(card.contexts).toHaveLength(5);
        expect(card.contexts.find((c) => c.id === oldestId)).toBeUndefined();
        expect(card.questionSentences).toBe('newest');
        expect(card.activeContextId).toBe(card.contexts[card.contexts.length - 1].id);
    });

    it('переключает активный контекст', async () => {
        const card = new Card('id123', 'folder1', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);
        await service.appendContext('id123', { text: 'one', translation: 'один' });
        await service.appendContext('id123', { text: 'two', translation: 'два' });
        const firstId = card.contexts[0].id;

        const updated = await service.setActiveContext('id123', firstId);
        expect(updated?.activeContextId).toBe(firstId);
        expect(updated?.questionSentences).toBe('one');
    });

    it('удаляет контекст', async () => {
        const card = new Card('id123', 'folder1', 'Q', 'A', false, new Date());
        repo.findById.mockResolvedValue(card);
        await service.appendContext('id123', { text: 'one', translation: 'один' });
        await service.appendContext('id123', { text: 'two', translation: 'два' });
        const removeId = card.contexts[0].id;

        const updated = await service.removeContext('id123', removeId);
        expect(updated?.contexts).toHaveLength(1);
        expect(updated?.questionSentences).toBe('two');
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

    it('массово обновляет статус изучения в папке', async () => {
        repo.updateLearnStatusByFolderId.mockResolvedValue(3);

        const updatedCount = await service.setFolderLearnStatus('folder1', true);

        expect(updatedCount).toBe(3);
        expect(repo.updateLearnStatusByFolderId).toHaveBeenCalledWith('folder1', true);
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
            createdAt: card.createdAt,
            contexts: [],
            activeContextId: null,
        });
        expect(publicDTO).not.toHaveProperty('lastShownAt');
        expect(publicDTO).not.toHaveProperty('reviewCount');
    });

    it('возвращает публичные поля с предложениями при их наличии', () => {
        const card = new Card('1', 'folder1', 'Q', 'A', false, new Date());
        card.replaceLegacySentences('QS', 'AS');
        const publicDTO = card.toPublicDTO();

        expect(publicDTO).toMatchObject({
            id: '1',
            folderId: 'folder1',
            question: 'Q',
            answer: 'A',
            questionSentences: 'QS',
            answerSentences: 'AS',
            isLearned: false,
            createdAt: card.createdAt,
            activeContextId: card.activeContextId,
        });
        expect(publicDTO.contexts).toHaveLength(1);
        expect(publicDTO.contexts[0]).toMatchObject({
            text: 'QS',
            translation: 'AS',
        });
    });
});