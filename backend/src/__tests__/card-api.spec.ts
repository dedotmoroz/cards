import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from "supertest"

describe('📦 Card Repository (e2e)', () => {
    let fastify: FastifyInstance;
    let folderId: string;
    let cardId: string;
    let authCookie: string;

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });

        // Регистрация пользователя
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: 'test@example.com', password: '123456' });

        // Логин и получение куки
        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: '123456' });

        authCookie = loginRes.headers['set-cookie'][0];

        // Получить userId через /auth/me
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', authCookie);

        const realUserId = meRes.body.id;

        // Создание папки
        const folderRes = await request(fastify.server)
            .post('/folders')
            .set('Cookie', authCookie)
            .send({ userId: realUserId, name: 'Test Folder' });

        folderId = folderRes.body.id;
    });

    afterAll(async () => {
        await fastify.close();
    });

    it('создает карточку (save)', async () => {
        const res = await request(fastify.server)
            .post('/cards')
            .set('Cookie', authCookie)
            .send({
                folderId,
                question: 'What is AI?',
                answer: 'Artificial Intelligence',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.question).toBe('What is AI?');

        cardId = res.body.id;
    });

    it('находит карточку по ID (findById)', async () => {
        const res = await request(fastify.server)
            .get(`/cards/folder/${folderId}`)
            .set('Cookie', authCookie)
        const card = res.body.find((c: any) => c.id === cardId);
        expect(card).toBeDefined();
        expect(card.question).toBe('What is AI?');
    });

    it('возвращает все карточки по папке (findAll)', async () => {
        const res = await request(fastify.server)
            .get(`/cards/folder/${folderId}`)
            .set('Cookie', authCookie)
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('обновляет карточку (update)', async () => {
        // Создаём карточку
        const createRes = await request(fastify.server)
            .post('/cards')
            .set('Cookie', authCookie)
            .send({
                folderId,
                question: 'Original Q',
                answer: 'Original A',
            });

        const updateCardId = createRes.body.id;
        expect(updateCardId).toBeDefined();

        // Обновляем карточку
        const updatedRes = await request(fastify.server)
            .patch(`/cards/${updateCardId}`)
            .set('Cookie', authCookie)
            .send({
                folderId,
                question: 'Updated Q',
                answer: 'Updated A',
                id: updateCardId, // сервер должен воспринимать одинаковый id как update
            });

        expect(updatedRes.status).toBe(200);

        // Проверяем обновление
        const getRes = await request(fastify.server)
            .get(`/cards/folder/${folderId}`)
            .set('Cookie', authCookie)
        const updatedCard = getRes.body.find((c: any) => c.id === updateCardId);
        expect(updatedCard).toBeDefined();
        expect(updatedCard.question).toBe('Updated Q');
        expect(updatedCard.answer).toBe('Updated A');
    });

    it('отмечает карточку как изученную (learn-status → true)', async () => {
        // Создаём карточку
        const createRes = await request(fastify.server)
            .post('/cards')
            .set('Cookie', authCookie)
            .send({
                folderId,
                question: 'Learn this',
                answer: 'And remember it',
            });

        const learnCardId = createRes.body.id;
        expect(learnCardId).toBeDefined();

        // Отмечаем как изученную
        const patchRes = await request(fastify.server)
            .patch(`/cards/${learnCardId}/learn-status`)
            .set('Cookie', authCookie)
            .send({ isLearned: true });

        expect(patchRes.status).toBe(200);
        expect(patchRes.body.status).toBe('ok');

        // Проверяем, что карточка действительно отмечена как изученная
        const getRes = await request(fastify.server)
            .get(`/cards/folder/${folderId}`)
            .set('Cookie', authCookie)
        const learnedCard = getRes.body.find((c: any) => c.id === learnCardId);
        expect(learnedCard).toBeDefined();
        expect(learnedCard.isLearned).toBe(true);
    });

    it('перемещает карточку в другую папку (PATCH /cards/:id/move)', async () => {
        const userId = '00000000-0000-0000-0000-000000000001';

        // Создаём первую папку и карточку
        const sourceFolderRes = await request(fastify.server)
            .post('/folders')
            .set('Cookie', authCookie)
            .send({ userId, name: 'Source Folder' });
        const sourceFolderId = sourceFolderRes.body.id;

        const targetFolderRes = await request(fastify.server)
            .post('/folders')
            .set('Cookie', authCookie)
            .send({ userId, name: 'Target Folder' });
        const targetFolderId = targetFolderRes.body.id;

        const createRes = await request(fastify.server)
            .post('/cards')
            .set('Cookie', authCookie)
            .send({
                folderId: sourceFolderId,
                question: 'Question to move',
                answer: 'Answer to move',
            });

        const cardId = createRes.body.id;
        expect(cardId).toBeDefined();

        // Перемещаем карточку в другую папку
        const moveRes = await request(fastify.server)
            .patch(`/cards/${cardId}/move`)
            .set('Cookie', authCookie)
            .send({ folderId: targetFolderId });

        expect(moveRes.status).toBe(200);
        expect(moveRes.body.folderId).toBe(targetFolderId);

        // Проверяем, что карточка больше не в старой папке
        const sourceFolderCards = await request(fastify.server)
            .get(`/cards/folder/${sourceFolderId}`)
            .set('Cookie', authCookie)
        const cardInOld = sourceFolderCards.body.find((c: any) => c.id === cardId);
        expect(cardInOld).toBeUndefined();

        // Проверяем, что карточка появилась в новой папке
        const targetFolderCards = await request(fastify.server)
            .get(`/cards/folder/${targetFolderId}`)
            .set('Cookie', authCookie)
        const cardInNew = targetFolderCards.body.find((c: any) => c.id === cardId);
        expect(cardInNew).toBeDefined();
        expect(cardInNew.question).toBe('Question to move');
    });

    it('удаляет карточку (delete)', async () => {
        // 1. Сначала создаём карточку
        const createRes = await request(fastify.server)
            .post('/cards')
            .set('Cookie', authCookie)
            .send({
                folderId,
                question: 'Temp Q',
                answer: 'Temp A',
                userId: 'u1',
            });

        const tempCardId = createRes.body.id;
        expect(tempCardId).toBeDefined();

        // 2. Теперь удаляем её
        const res = await request(fastify.server)
            .delete(`/cards/${tempCardId}`)
            .set('Cookie', authCookie);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('удаленная карточка больше не возвращается (findById → null)', async () => {
        // Создаём и удаляем карточку
        const createRes = await request(fastify.server)
            .post('/cards')
            .set('Cookie', authCookie)
            .send({
                folderId,
                question: 'To be deleted',
                answer: 'Will disappear',
            });

        const toDeleteId = createRes.body.id;
        expect(toDeleteId).toBeDefined();

        await request(fastify.server).delete(`/cards/${toDeleteId}`).set('Cookie', authCookie);

        // Проверяем, что карточка отсутствует
        const res = await request(fastify.server)
            .get(`/cards/folder/${folderId}`)
            .set('Cookie', authCookie)
        const card = res.body.find((c: any) => c.id === toDeleteId);
        expect(card).toBeUndefined();
    });
});