import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from 'supertest';

describe('📖 Context Reading API (e2e)', () => {
    let fastify: FastifyInstance;
    let authCookie: string;
    let userId: string;
    let folderId: string;
    let cardIds: string[] = [];

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });

        // Регистрация пользователя
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: 'contextreading@example.com', password: '123456' });

        // Логин и получение куки
        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: 'contextreading@example.com', password: '123456' });

        authCookie = loginRes.headers['set-cookie'][0];

        // Получить userId через /auth/me
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', authCookie);

        userId = meRes.body.id;

        // Создание папки
        const folderRes = await request(fastify.server)
            .post('/folders')
            .set('Cookie', authCookie)
            .send({ userId, name: 'Context Reading Test Folder' });

        folderId = folderRes.body.id;

        // Создаём несколько невыученных карточек для тестирования
        for (let i = 1; i <= 5; i++) {
            const cardRes = await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: `Question ${i}`,
                    answer: `Answer ${i}`,
                });
            cardIds.push(cardRes.body.id);
        }
    });

    afterAll(async () => {
        await fastify.close();
    });

    describe('POST /context-reading/next', () => {
        it('возвращает первую порцию карточек когда состояние не существует', async () => {
            // Сбрасываем прогресс для изоляции теста
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            const res = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('cards');
            expect(res.body).toHaveProperty('progress');
            expect(res.body).toHaveProperty('completed');

            expect(Array.isArray(res.body.cards)).toBe(true);
            expect(res.body.cards.length).toBe(3);
            expect(res.body.progress.used).toBe(3);
            expect(res.body.progress.total).toBe(5);
            expect(res.body.completed).toBe(false);

            // Проверяем структуру карточки
            const card = res.body.cards[0];
            expect(card).toHaveProperty('id');
            expect(card).toHaveProperty('question');
            expect(card).toHaveProperty('answer');
            expect(card).toHaveProperty('folderId');
        });

        it('не повторяет карточки при следующем запросе', async () => {
            // Сбрасываем прогресс для изоляции теста
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            // Первый запрос
            const firstRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 2,
                });

            expect(firstRes.status).toBe(200);
            const firstIds = firstRes.body.cards.map((c: any) => c.id);

            // Второй запрос
            const secondRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 2,
                });

            expect(secondRes.status).toBe(200);
            const secondIds = secondRes.body.cards.map((c: any) => c.id);

            // Проверяем, что карточки не повторяются
            firstIds.forEach((id: string) => {
                expect(secondIds).not.toContain(id);
            });
        });

        it('возвращает completed=true когда все карточки использованы', async () => {
            // Сбрасываем прогресс для изоляции теста
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            // Используем все карточки постепенно - сначала 3, потом оставшиеся 2
            const firstRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            expect(firstRes.status).toBe(200);
            expect(firstRes.body.cards.length).toBe(3);
            expect(firstRes.body.completed).toBe(false);

            // Используем оставшиеся карточки
            const secondRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            expect(secondRes.status).toBe(200);
            expect(secondRes.body.cards.length).toBe(2); // Осталось 2 карточки
            expect(secondRes.body.completed).toBe(false);
            expect(secondRes.body.progress.used).toBe(5); // Все 5 использованы

            // Следующий запрос должен вернуть completed=true
            const res = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            expect(res.status).toBe(200);
            expect(res.body.cards).toHaveLength(0);
            expect(res.body.completed).toBe(true);
            expect(res.body.progress.used).toBe(5);
            expect(res.body.progress.total).toBe(5);
        });

        it('корректно обновляет прогресс', async () => {
            // Сбрасываем прогресс для этого теста (через reset)
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            // Первый запрос
            const firstRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 2,
                });

            expect(firstRes.body.progress.used).toBe(2);
            expect(firstRes.body.progress.total).toBe(5);

            // Второй запрос
            const secondRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 2,
                });

            expect(secondRes.body.progress.used).toBe(4);
            expect(secondRes.body.progress.total).toBe(5);
        });

        it('использует дефолтный limit=3 если limit не указан', async () => {
            // Сбрасываем прогресс
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            const res = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    // limit не указываем
                });

            expect(res.status).toBe(200);
            expect(res.body.cards.length).toBe(3);
        });

        it('валидирует limit (минимум 1, максимум 5)', async () => {
            // limit < 1
            const res1 = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 0,
                });
            expect(res1.status).toBe(400);

            // limit > 5
            const res2 = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 6,
                });
            expect(res2.status).toBe(400);
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post('/context-reading/next')
                .send({
                    folderId,
                    limit: 3,
                });

            expect(res.status).toBe(401);
        });

        it('требует folderId', async () => {
            const res = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    // folderId не указан
                    limit: 3,
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /context-reading/reset', () => {
        it('сбрасывает прогресс контекстного чтения', async () => {
            // Сначала используем некоторые карточки
            await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            // Сбрасываем прогресс
            const resetRes = await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            expect(resetRes.status).toBe(200);
            expect(resetRes.body).toEqual({ ok: true });

            // После сброса можем снова получить карточки
            const nextRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            expect(nextRes.status).toBe(200);
            expect(nextRes.body.cards.length).toBeGreaterThan(0);
            expect(nextRes.body.progress.used).toBe(3); // Снова начинается с 0
        });

        it('после reset можно получить все карточки заново', async () => {
            // Сбрасываем прогресс
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            // Получаем первые карточки
            const firstRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 2,
                });

            const firstIds = firstRes.body.cards.map((c: any) => c.id);

            // Сбрасываем снова
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            // Получаем карточки снова - должны быть те же самые (или хотя бы не пусто)
            const secondRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 2,
                });

            expect(secondRes.body.cards.length).toBe(2);
            // После reset можем получить карточки (не обязательно те же самые из-за shuffle)
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post('/context-reading/reset')
                .send({ folderId });

            expect(res.status).toBe(401);
        });

        it('требует folderId', async () => {
            const res = await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({
                    // folderId не указан
                });

            expect(res.status).toBe(400);
        });
    });

    describe('Интеграция reset и next', () => {
        it('после reset прогресс начинается заново', async () => {
            // Сбрасываем прогресс
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            // Используем все карточки постепенно - сначала 3, потом оставшиеся 2
            await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            // Используем оставшиеся 2 карточки
            await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            // Проверяем, что completed = true (все карточки использованы)
            const completedRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });
            expect(completedRes.body.completed).toBe(true);
            expect(completedRes.body.cards).toHaveLength(0);
            expect(completedRes.body.progress.used).toBe(5);
            expect(completedRes.body.progress.total).toBe(5);

            // Сбрасываем
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            // После reset можем снова получить карточки
            const afterResetRes = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 3,
                });

            expect(afterResetRes.body.completed).toBe(false);
            expect(afterResetRes.body.cards.length).toBe(3);
            expect(afterResetRes.body.progress.used).toBe(3);
        });
    });
});

