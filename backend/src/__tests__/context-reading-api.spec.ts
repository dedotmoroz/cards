import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from 'supertest';
import { TEST_FOLDER_LANGUAGES } from './test-folder-defaults';

jest.mock('../adapters/ai/ai-service-client', () => ({
    requestContextGeneration: jest.fn(),
    fetchContextGenerationStatus: jest.fn(),
    fetchContextAudio: jest.fn(),
    fetchContextArtifactAudio: jest.fn(),
    fetchContextAudioExistsByJobId: jest.fn(),
    fetchContextAudioExistsByArtifactId: jest.fn(),
    generateContextAudio: jest.fn(),
    generateAndPromoteContextAudio: jest.fn(),
    promoteContextAudio: jest.fn(),
    deleteContextArtifactAudio: jest.fn(),
}));

import {
    requestContextGeneration,
    fetchContextGenerationStatus,
    fetchContextAudio,
    fetchContextArtifactAudio,
    promoteContextAudio,
    deleteContextArtifactAudio,
} from '../adapters/ai/ai-service-client';

const mockedRequestContextGeneration = requestContextGeneration as jest.MockedFunction<typeof requestContextGeneration>;
const mockedFetchContextGenerationStatus = fetchContextGenerationStatus as jest.MockedFunction<typeof fetchContextGenerationStatus>;
const mockedFetchContextAudio = fetchContextAudio as jest.MockedFunction<typeof fetchContextAudio>;
const mockedFetchContextArtifactAudio = fetchContextArtifactAudio as jest.MockedFunction<typeof fetchContextArtifactAudio>;
const mockedPromoteContextAudio = promoteContextAudio as jest.MockedFunction<typeof promoteContextAudio>;
const mockedDeleteContextArtifactAudio = deleteContextArtifactAudio as jest.MockedFunction<typeof deleteContextArtifactAudio>;

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
            .send({ userId, name: 'Context Reading Test Folder', ...TEST_FOLDER_LANGUAGES });

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

        it('returns 400 when onlyUnlearned conflicts with active session', async () => {
            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 1,
                    onlyUnlearned: true,
                });

            const bad = await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    limit: 1,
                    onlyUnlearned: false,
                });

            expect(bad.status).toBe(400);
            expect(bad.body.message).toBeDefined();
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

    describe('POST /context-reading/generate', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedRequestContextGeneration.mockResolvedValue({ jobId: 'context-job-123' });
        });

        it('запускает генерацию текста для карточек', async () => {
            // Используем первые 3 карточки
            const cardIdsToGenerate = cardIds.slice(0, 3);

            const res = await request(fastify.server)
                .post('/context-reading/generate')
                .set('Cookie', authCookie)
                .send({
                    cardIds: cardIdsToGenerate,
                    lang: 'en',
                    level: 'B1',
                });

            expect(res.status).toBe(202);
            expect(res.body).toHaveProperty('jobId');
            expect(typeof res.body.jobId).toBe('string');
        });

        it('требует минимум 3 карточки', async () => {
            const res = await request(fastify.server)
                .post('/context-reading/generate')
                .set('Cookie', authCookie)
                .send({
                    cardIds: [cardIds[0], cardIds[1]], // только 2 карточки
                    lang: 'en',
                });

            expect(res.status).toBe(400);
        });

        it('требует максимум 5 карточек', async () => {
            const res = await request(fastify.server)
                .post('/context-reading/generate')
                .set('Cookie', authCookie)
                .send({
                    cardIds: cardIds.concat(['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002']), // 7 карточек
                    lang: 'en',
                });

            expect(res.status).toBe(400);
        });

        it('не требует lang и передаёт языки папки в ai-service', async () => {
            const cardIdsToGenerate = cardIds.slice(0, 3);

            const res = await request(fastify.server)
                .post('/context-reading/generate')
                .set('Cookie', authCookie)
                .send({
                    cardIds: cardIdsToGenerate,
                    level: 'B1',
                });

            expect(res.status).toBe(202);
            expect(res.body).toEqual({ jobId: 'context-job-123' });
            expect(mockedRequestContextGeneration).toHaveBeenCalledWith(
                expect.objectContaining({
                    lang: TEST_FOLDER_LANGUAGES.sideALanguage,
                    translationLang: TEST_FOLDER_LANGUAGES.sideBLanguage,
                    level: 'B1',
                }),
            );
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post('/context-reading/generate')
                .send({
                    cardIds: cardIds.slice(0, 3),
                    lang: 'en',
                });

            expect(res.status).toBe(401);
        });

        it('возвращает 404 для несуществующих карточек', async () => {
            const fakeCardIds = [
                '00000000-0000-0000-0000-000000000001',
                '00000000-0000-0000-0000-000000000002',
                '00000000-0000-0000-0000-000000000003',
            ];

            const res = await request(fastify.server)
                .post('/context-reading/generate')
                .set('Cookie', authCookie)
                .send({
                    cardIds: fakeCardIds,
                    lang: 'en',
                });

            expect(res.status).toBe(404);
        });
    });

    describe('GET /context-reading/generate-status', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedRequestContextGeneration.mockResolvedValue({ jobId: 'context-job-123' });
            mockedFetchContextGenerationStatus.mockResolvedValue({
                id: 'context-job-123',
                state: 'completed',
                progress: 100,
                result: {
                    text: 'Hello world test',
                    translation: 'Привет мир тест',
                },
                queueType: 'context',
            });
        });

        it('возвращает статус генерации текста', async () => {
            // Запускаем генерацию
            const generateRes = await request(fastify.server)
                .post('/context-reading/generate')
                .set('Cookie', authCookie)
                .send({
                    cardIds: cardIds.slice(0, 3),
                    lang: 'en',
                });

            const jobId = generateRes.body.jobId;

            const res = await request(fastify.server)
                .get('/context-reading/generate-status')
                .set('Cookie', authCookie)
                .query({ jobId });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('state');
        });

        it('требует jobId в query', async () => {
            const res = await request(fastify.server)
                .get('/context-reading/generate-status')
                .set('Cookie', authCookie);

            expect(res.status).toBe(400);
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .get('/context-reading/generate-status')
                .query({ jobId: 'some-job-id' });

            expect(res.status).toBe(401);
        });

        it('возвращает 404 для несуществующего jobId', async () => {
            mockedFetchContextGenerationStatus.mockRejectedValue(
                new Error('[ai-service] Unexpected status 404 for http://localhost:4000/jobs/non-existent-job-id?queue=context. Body: not found'),
            );

            const res = await request(fastify.server)
                .get('/context-reading/generate-status')
                .set('Cookie', authCookie)
                .query({ jobId: 'non-existent-job-id' });

            expect(res.status).toBe(404);
        });
    });

    describe('GET /context-reading/audio', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('проксирует mp3 из ai-service', async () => {
            mockedFetchContextAudio.mockResolvedValue(
                new Response(Buffer.from('fake-mp3'), {
                    status: 200,
                    headers: { 'Content-Type': 'audio/mpeg' },
                }),
            );

            const res = await request(fastify.server)
                .get('/context-reading/audio')
                .set('Cookie', authCookie)
                .query({ jobId: 'context-job-123' });

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('audio/mpeg');
            expect(res.body).toEqual(Buffer.from('fake-mp3'));
            expect(mockedFetchContextAudio).toHaveBeenCalledWith('context-job-123');
        });

        it('требует jobId или artifactId в query', async () => {
            const res = await request(fastify.server)
                .get('/context-reading/audio')
                .set('Cookie', authCookie);

            expect(res.status).toBe(400);
        });

        it('проксирует mp3 по artifactId', async () => {
            mockedFetchContextArtifactAudio.mockResolvedValue(
                new Response(Buffer.from('artifact-mp3'), {
                    status: 200,
                    headers: { 'Content-Type': 'audio/mpeg' },
                }),
            );

            const artifactId = '11111111-1111-1111-1111-111111111111';
            const res = await request(fastify.server)
                .get('/context-reading/audio')
                .set('Cookie', authCookie)
                .query({ artifactId });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(Buffer.from('artifact-mp3'));
            expect(mockedFetchContextArtifactAudio).toHaveBeenCalledWith(artifactId);
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .get('/context-reading/audio')
                .query({ jobId: 'context-job-123' });

            expect(res.status).toBe(401);
        });

        it('возвращает 404 если ai-service не нашёл аудио', async () => {
            mockedFetchContextAudio.mockRejectedValue(
                new Error('[ai-service] Context audio not found for job missing-audio'),
            );

            const res = await request(fastify.server)
                .get('/context-reading/audio')
                .set('Cookie', authCookie)
                .query({ jobId: 'missing-audio' });

            expect(res.status).toBe(404);
        });
    });

    describe('POST /context-reading/persist and GET /context-reading/history', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedPromoteContextAudio.mockResolvedValue({ ok: true, hasAudio: true });
            mockedDeleteContextArtifactAudio.mockResolvedValue({ ok: true, deleted: true });
        });

        it('сохраняет артефакт и отдаёт его в history ASC', async () => {
            mockedFetchContextGenerationStatus.mockResolvedValue({
                id: 'persist-job-1',
                state: 'completed',
                progress: 100,
                result: {
                    text: 'Persisted text',
                    translation: 'Сохранённый текст',
                    hasAudio: true,
                },
                queueType: 'context',
            });

            const persistRes = await request(fastify.server)
                .post('/context-reading/persist')
                .set('Cookie', authCookie)
                .send({
                    jobId: 'persist-job-1',
                    folderId,
                    cardIds: cardIds.slice(0, 3),
                    level: 'B1',
                });

            expect(persistRes.status).toBe(200);
            expect(persistRes.body.text).toBe('Persisted text');
            expect(persistRes.body.hasAudio).toBe(true);
            expect(persistRes.body.cardsSnapshot).toHaveLength(3);
            expect(mockedPromoteContextAudio).toHaveBeenCalled();

            const historyRes = await request(fastify.server)
                .get('/context-reading/history')
                .set('Cookie', authCookie)
                .query({ folderId });

            expect(historyRes.status).toBe(200);
            expect(Array.isArray(historyRes.body.artifacts)).toBe(true);
            expect(historyRes.body.artifacts.some((a: { id: string }) => a.id === persistRes.body.id)).toBe(true);
        });

        it('идемпотентен для того же jobId', async () => {
            mockedFetchContextGenerationStatus.mockResolvedValue({
                id: 'persist-job-2',
                state: 'completed',
                progress: 100,
                result: {
                    text: 'Same job',
                    translation: 'Тот же job',
                    hasAudio: false,
                },
                queueType: 'context',
            });

            const first = await request(fastify.server)
                .post('/context-reading/persist')
                .set('Cookie', authCookie)
                .send({
                    jobId: 'persist-job-2',
                    folderId,
                    cardIds: cardIds.slice(0, 3),
                });

            const second = await request(fastify.server)
                .post('/context-reading/persist')
                .set('Cookie', authCookie)
                .send({
                    jobId: 'persist-job-2',
                    folderId,
                    cardIds: cardIds.slice(0, 3),
                });

            expect(first.status).toBe(200);
            expect(second.status).toBe(200);
            expect(second.body.id).toBe(first.body.id);
        });

        it('добавляет новый артефакт без удаления предыдущего', async () => {
            mockedFetchContextGenerationStatus
                .mockResolvedValueOnce({
                    id: 'persist-job-old',
                    state: 'completed',
                    progress: 100,
                    result: {
                        text: 'Old',
                        translation: 'Старый',
                        hasAudio: true,
                    },
                    queueType: 'context',
                })
                .mockResolvedValueOnce({
                    id: 'persist-job-new',
                    state: 'completed',
                    progress: 100,
                    result: {
                        text: 'New',
                        translation: 'Новый',
                        hasAudio: true,
                    },
                    queueType: 'context',
                });

            const oldRes = await request(fastify.server)
                .post('/context-reading/persist')
                .set('Cookie', authCookie)
                .send({
                    jobId: 'persist-job-old',
                    folderId,
                    cardIds: cardIds.slice(0, 3),
                });

            const newRes = await request(fastify.server)
                .post('/context-reading/persist')
                .set('Cookie', authCookie)
                .send({
                    jobId: 'persist-job-new',
                    folderId,
                    cardIds: cardIds.slice(0, 3),
                });

            expect(oldRes.status).toBe(200);
            expect(newRes.status).toBe(200);
            expect(newRes.body.id).not.toBe(oldRes.body.id);
            expect(newRes.body.text).toBe('New');
            expect(mockedDeleteContextArtifactAudio).not.toHaveBeenCalledWith(oldRes.body.id);

            const historyRes = await request(fastify.server)
                .get('/context-reading/history')
                .set('Cookie', authCookie)
                .query({ folderId });

            const ids = historyRes.body.artifacts.map((a: { id: string }) => a.id);
            expect(ids).toContain(oldRes.body.id);
            expect(ids).toContain(newRes.body.id);
        });

        it('prune удаляет самый старый при превышении лимита 10', async () => {
            const createdIds: string[] = [];

            for (let i = 0; i < 11; i++) {
                mockedFetchContextGenerationStatus.mockResolvedValueOnce({
                    id: `persist-job-prune-${i}`,
                    state: 'completed',
                    progress: 100,
                    result: {
                        text: `Text ${i}`,
                        translation: `Перевод ${i}`,
                        hasAudio: true,
                    },
                    queueType: 'context',
                });

                const res = await request(fastify.server)
                    .post('/context-reading/persist')
                    .set('Cookie', authCookie)
                    .send({
                        jobId: `persist-job-prune-${i}`,
                        folderId,
                        cardIds: cardIds.slice(0, 3),
                    });

                expect(res.status).toBe(200);
                createdIds.push(res.body.id);
            }

            const historyRes = await request(fastify.server)
                .get('/context-reading/history')
                .set('Cookie', authCookie)
                .query({ folderId });

            expect(historyRes.body.artifacts.length).toBeLessThanOrEqual(10);
            expect(historyRes.body.artifacts.map((a: { id: string }) => a.id)).not.toContain(createdIds[0]);
            expect(mockedDeleteContextArtifactAudio).toHaveBeenCalledWith(createdIds[0]);
        });

        it('reset прогресса не удаляет history', async () => {
            mockedFetchContextGenerationStatus.mockResolvedValue({
                id: 'persist-job-reset',
                state: 'completed',
                progress: 100,
                result: {
                    text: 'Keep me',
                    translation: 'Оставь',
                    hasAudio: false,
                },
                queueType: 'context',
            });

            await request(fastify.server)
                .post('/context-reading/persist')
                .set('Cookie', authCookie)
                .send({
                    jobId: 'persist-job-reset',
                    folderId,
                    cardIds: cardIds.slice(0, 3),
                });

            await request(fastify.server)
                .post('/context-reading/reset')
                .set('Cookie', authCookie)
                .send({ folderId });

            const historyRes = await request(fastify.server)
                .get('/context-reading/history')
                .set('Cookie', authCookie)
                .query({ folderId });

            expect(historyRes.status).toBe(200);
            expect(
                historyRes.body.artifacts.some((a: { text: string }) => a.text === 'Keep me')
            ).toBe(true);
        });

        it('возвращает 400 если job не completed', async () => {
            mockedFetchContextGenerationStatus.mockResolvedValue({
                id: 'persist-job-active',
                state: 'active',
                progress: 40,
                result: null,
                queueType: 'context',
            });

            const res = await request(fastify.server)
                .post('/context-reading/persist')
                .set('Cookie', authCookie)
                .send({
                    jobId: 'persist-job-active',
                    folderId,
                    cardIds: cardIds.slice(0, 3),
                });

            expect(res.status).toBe(400);
        });
    });
});

