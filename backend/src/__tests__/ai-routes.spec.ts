import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from 'supertest';

jest.mock('../lib/turnstile', () => ({
    verifyTurnstileToken: jest.fn().mockResolvedValue(true),
}));

jest.mock('../adapters/ai/ai-service-client', () => ({
    requestGeneration: jest.fn(),
    fetchGenerationStatus: jest.fn(),
}));

import { requestGeneration, fetchGenerationStatus } from '../adapters/ai/ai-service-client';

const mockedRequestGeneration = requestGeneration as jest.MockedFunction<typeof requestGeneration>;
const mockedFetchGenerationStatus = fetchGenerationStatus as jest.MockedFunction<typeof fetchGenerationStatus>;

describe('AI routes (e2e)', () => {
    let fastify: FastifyInstance;
    let authCookie: string;
    let userId: string;
    let folderId: string;

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });

        await request(fastify.server)
            .post('/auth/register')
            .send({
                email: 'testai@example.com',
                password: '123456',
                turnstileToken: 'test-captcha-token',
            });

        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: 'testai@example.com', password: '123456' });

        authCookie = loginRes.headers['set-cookie'][0];

        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', authCookie);

        userId = meRes.body.id;

        const folderRes = await request(fastify.server)
            .post('/folders')
            .set('Cookie', authCookie)
            .send({
                userId,
                name: 'AI Test Folder',
                sideALanguage: 'de',
                sideBLanguage: 'ru',
            });

        folderId = folderRes.body.id;
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockedRequestGeneration.mockResolvedValue({ jobId: 'job-test-123' });
    });

    describe('POST /cards/:id/generate', () => {
        it('passes folder side languages to ai-service', async () => {
            const createRes = await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'Hund',
                    answer: 'собака',
                });

            const cardId = createRes.body.id;

            const res = await request(fastify.server)
                .post(`/cards/${cardId}/generate`)
                .set('Cookie', authCookie)
                .send({});

            expect(res.status).toBe(202);
            expect(res.body).toEqual({ jobId: 'job-test-123' });
            expect(mockedRequestGeneration).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: 'Hund',
                    translationSample: 'собака',
                    lang: 'de',
                    translationLang: 'ru',
                    count: 1,
                    level: 'B1',
                }),
            );
        });

        it('allows body.lang override while translationLang stays from folder', async () => {
            const createRes = await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'chat',
                    answer: 'кот',
                });

            const cardId = createRes.body.id;

            await request(fastify.server)
                .post(`/cards/${cardId}/generate`)
                .set('Cookie', authCookie)
                .send({ lang: 'fr' });

            expect(mockedRequestGeneration).toHaveBeenCalledWith(
                expect.objectContaining({
                    lang: 'fr',
                    translationLang: 'ru',
                }),
            );
        });

        it('returns 404 for missing card', async () => {
            const res = await request(fastify.server)
                .post('/cards/00000000-0000-0000-0000-000000000000/generate')
                .set('Cookie', authCookie)
                .send({});

            expect(res.status).toBe(404);
            expect(mockedRequestGeneration).not.toHaveBeenCalled();
        });

        it('requires authentication', async () => {
            const res = await request(fastify.server)
                .post('/cards/00000000-0000-0000-0000-000000000000/generate')
                .send({});

            expect(res.status).toBe(401);
            expect(mockedRequestGeneration).not.toHaveBeenCalled();
        });
    });

    describe('GET /cards/:id/generate-status', () => {
        it('saves sentences from generate job result', async () => {
            const createRes = await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'self-driven',
                    answer: 'самостоятельный',
                });

            const cardId = createRes.body.id;

            mockedFetchGenerationStatus.mockResolvedValue({
                id: 'job-234',
                state: 'completed',
                progress: 100,
                queueType: 'generate',
                result: {
                    sentences: [
                        {
                            text: 'In the city, being self-driven is important.',
                            translation: 'В городе быть самостоятельным важно.',
                        },
                    ],
                },
            });

            const res = await request(fastify.server)
                .get(`/cards/${cardId}/generate-status`)
                .query({ jobId: 'job-234' })
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('completed');
            expect(res.body.card.questionSentences).toContain('self-driven');
            expect(res.body.card.answerSentences).toContain('самостоятельным');
        });

        it('rejects context job type', async () => {
            const createRes = await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'word',
                    answer: 'слово',
                });

            const cardId = createRes.body.id;

            mockedFetchGenerationStatus.mockResolvedValue({
                id: '234',
                state: 'completed',
                progress: 100,
                queueType: 'context',
                result: {
                    sentences: [],
                },
            });

            const res = await request(fastify.server)
                .get(`/cards/${cardId}/generate-status`)
                .query({ jobId: '234' })
                .set('Cookie', authCookie);

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Expected generate job');
        });
    });
});
