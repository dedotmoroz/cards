import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from "supertest";
import ExcelJS from 'exceljs';
import { TEST_FOLDER_LANGUAGES } from './test-folder-defaults';

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
            .send({ userId: realUserId, name: 'Test Folder', ...TEST_FOLDER_LANGUAGES });

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
            .send({ userId, name: 'Source Folder', ...TEST_FOLDER_LANGUAGES });
        const sourceFolderId = sourceFolderRes.body.id;

        const targetFolderRes = await request(fastify.server)
            .post('/folders')
            .set('Cookie', authCookie)
            .send({ userId, name: 'Target Folder', ...TEST_FOLDER_LANGUAGES });
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

    describe('POST /ext/cards', () => {
        it('создает карточку из браузерного расширения', async () => {
            const res = await request(fastify.server)
                .post('/ext/cards')
                .set('Cookie', authCookie)
                .send({
                    word: 'hello',
                    folderId,
                    sourceUrl: 'https://example.com',
                    sentence: 'Hello world',
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.word).toBe('hello');
            expect(res.body.folderId).toBe(folderId);
        });

        it('создает карточку из расширения без sentence', async () => {
            const res = await request(fastify.server)
                .post('/ext/cards')
                .set('Cookie', authCookie)
                .send({
                    word: 'test',
                    folderId,
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.word).toBe('test');
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post('/ext/cards')
                .send({
                    word: 'hello',
                    folderId,
                });

            expect(res.status).toBe(401);
        });

        it('требует word и folderId', async () => {
            const res = await request(fastify.server)
                .post('/ext/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /cards/folder/:folderId/export', () => {
        it('экспортирует карточки в Excel', async () => {
            // Создаем несколько карточек для экспорта
            await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'Question 1',
                    answer: 'Answer 1',
                });

            await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'Question 2',
                    answer: 'Answer 2',
                });

            const res = await request(fastify.server)
                .get(`/cards/folder/${folderId}/export`)
                .set('Cookie', authCookie)
                .buffer()
                .parse((res, callback) => {
                    const chunks: Buffer[] = [];
                    res.on('data', (chunk: Buffer) => {
                        chunks.push(chunk);
                    });
                    res.on('end', () => {
                        callback(null, Buffer.concat(chunks));
                    });
                });

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            expect(res.headers['content-disposition']).toContain('.xlsx');
            expect(Buffer.isBuffer(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .get(`/cards/folder/${folderId}/export`);

            expect(res.status).toBe(401);
        });
    });

    describe('POST /cards/folder/:folderId/import', () => {
        it('импортирует карточки из Excel файла', async () => {
            // Создаем простой Excel файл в памяти
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Cards');
            
            worksheet.columns = [
                { header: 'Сторона A', key: 'question', width: 50 },
                { header: 'Сторона B', key: 'answer', width: 50 },
            ];
            
            worksheet.addRow({ question: 'Imported Question 1', answer: 'Imported Answer 1' });
            worksheet.addRow({ question: 'Imported Question 2', answer: 'Imported Answer 2' });
            
            const buffer = await workbook.xlsx.writeBuffer();

            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/import`)
                .set('Cookie', authCookie)
                .attach('file', Buffer.from(buffer), 'test.xlsx');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('successCount');
            expect(res.body).toHaveProperty('errorCount');
            expect(res.body.successCount).toBeGreaterThan(0);
        });

        it('возвращает ошибку для невалидного файла', async () => {
            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/import`)
                .set('Cookie', authCookie)
                .attach('file', Buffer.from('invalid file'), 'test.txt');

            expect(res.status).toBe(400);
        });

        it('возвращает ошибку для Excel без нужных колонок', async () => {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Cards');
            
            worksheet.addRow({ col1: 'Wrong', col2: 'Columns' });
            
            const buffer = await workbook.xlsx.writeBuffer();

            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/import`)
                .set('Cookie', authCookie)
                .attach('file', Buffer.from(buffer), 'test.xlsx');

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Сторона A');
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/import`);

            expect(res.status).toBe(401);
        });

        it('возвращает 404 для несуществующей папки', async () => {
            const fakeFolderId = '00000000-0000-0000-0000-000000000000';
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Cards');
            
            worksheet.columns = [
                { header: 'Сторона A', key: 'question', width: 50 },
                { header: 'Сторона B', key: 'answer', width: 50 },
            ];
            
            const buffer = await workbook.xlsx.writeBuffer();

            const res = await request(fastify.server)
                .post(`/cards/folder/${fakeFolderId}/import`)
                .set('Cookie', authCookie)
                .attach('file', buffer, 'test.xlsx');

            expect(res.status).toBe(404);
        });
    });

    describe('POST /cards/:id/generate', () => {
        it('запускает генерацию предложений для карточки', async () => {
            // Создаем карточку
            const createRes = await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'hello',
                    answer: 'привет',
                });

            const cardId = createRes.body.id;

            const res = await request(fastify.server)
                .post(`/cards/${cardId}/generate`)
                .set('Cookie', authCookie)
                .send({
                    lang: 'en',
                    level: 'B1',
                    count: 1,
                });

            expect(res.status).toBe(202);
            expect(res.body).toHaveProperty('jobId');
            expect(typeof res.body.jobId).toBe('string');
        });

        it('возвращает 404 для несуществующей карточки', async () => {
            const fakeCardId = '00000000-0000-0000-0000-000000000000';
            const res = await request(fastify.server)
                .post(`/cards/${fakeCardId}/generate`)
                .set('Cookie', authCookie)
                .send({});

            expect(res.status).toBe(404);
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post(`/cards/${cardId}/generate`)
                .send({});

            expect(res.status).toBe(401);
        });
    });

    describe('GET /cards/:id/generate-status', () => {
        it('возвращает статус генерации', async () => {
            // Создаем карточку и запускаем генерацию
            const createRes = await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'test',
                    answer: 'тест',
                });

            const cardId = createRes.body.id;

            const generateRes = await request(fastify.server)
                .post(`/cards/${cardId}/generate`)
                .set('Cookie', authCookie)
                .send({});

            const jobId = generateRes.body.jobId;

            const res = await request(fastify.server)
                .get(`/cards/${cardId}/generate-status`)
                .set('Cookie', authCookie)
                .query({ jobId });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status');
        });

        it('возвращает 404 для несуществующей карточки', async () => {
            const fakeCardId = '00000000-0000-0000-0000-000000000000';
            const res = await request(fastify.server)
                .get(`/cards/${fakeCardId}/generate-status`)
                .set('Cookie', authCookie)
                .query({ jobId: 'some-job-id' });

            expect(res.status).toBe(404);
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .get(`/cards/${cardId}/generate-status`)
                .query({ jobId: 'some-job-id' });

            expect(res.status).toBe(401);
        });

        it('требует jobId в query', async () => {
            const res = await request(fastify.server)
                .get(`/cards/${cardId}/generate-status`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(400);
        });
    });
});