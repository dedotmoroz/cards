import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from 'supertest';

// Мокаем translate-service
jest.mock('../adapters/ai/translate-service', () => ({
    translateText: jest.fn(),
    mapLanguageToGoogleFormat: jest.fn((lang: string) => lang),
}));

import { translateText, mapLanguageToGoogleFormat } from '../adapters/ai/translate-service';

const mockedTranslateText = translateText as jest.MockedFunction<typeof translateText>;
const mockedMapLanguageToGoogleFormat = mapLanguageToGoogleFormat as jest.MockedFunction<typeof mapLanguageToGoogleFormat>;

describe('🌐 Translate API (e2e)', () => {
    let fastify: FastifyInstance;
    let authCookie: string;

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });

        // Регистрация пользователя
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: 'testtranslate@example.com', password: '123456' });

        // Логин и получение куки
        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: 'testtranslate@example.com', password: '123456' });

        authCookie = loginRes.headers['set-cookie'][0];
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockedMapLanguageToGoogleFormat.mockImplementation((lang: string) => lang);
    });

    describe('POST /translate', () => {
        it('переводит текст успешно', async () => {
            mockedTranslateText.mockResolvedValue({
                translatedText: 'привет',
                detectedSourceLanguage: 'en',
            });

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('translatedText');
            expect(res.body).toHaveProperty('detectedSourceLanguage');
            expect(res.body.translatedText).toBe('привет');
            expect(res.body.detectedSourceLanguage).toBe('en');
            expect(mockedTranslateText).toHaveBeenCalledWith({
                text: 'hello',
                targetLang: 'ru',
                sourceLang: undefined,
            });
        });

        it('переводит текст с указанием исходного языка', async () => {
            mockedTranslateText.mockResolvedValue({
                translatedText: 'привет',
            });

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'ru',
                    sourceLang: 'en',
                });

            expect(res.status).toBe(200);
            expect(res.body.translatedText).toBe('привет');
            expect(mockedTranslateText).toHaveBeenCalledWith({
                text: 'hello',
                targetLang: 'ru', // mapLanguageToGoogleFormat вызывается для targetLang
                sourceLang: 'en', // и для sourceLang
            });
            expect(mockedMapLanguageToGoogleFormat).toHaveBeenCalledWith('ru');
            expect(mockedMapLanguageToGoogleFormat).toHaveBeenCalledWith('en');
        });

        it('использует mapLanguageToGoogleFormat для языков', async () => {
            mockedMapLanguageToGoogleFormat.mockImplementation((lang: string) => {
                if (lang === 'uk') return 'uk';
                if (lang === 'ru') return 'ru';
                return lang;
            });

            mockedTranslateText.mockResolvedValue({
                translatedText: 'привіт',
            });

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'uk',
                });

            expect(res.status).toBe(200);
            expect(mockedMapLanguageToGoogleFormat).toHaveBeenCalledWith('uk');
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post('/translate')
                .send({
                    text: 'hello',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(401);
            expect(mockedTranslateText).not.toHaveBeenCalled();
        });

        it('возвращает ошибку 400 при отсутствии text', async () => {
            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    targetLang: 'ru',
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(mockedTranslateText).not.toHaveBeenCalled();
        });

        it('возвращает ошибку 400 при отсутствии targetLang', async () => {
            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(mockedTranslateText).not.toHaveBeenCalled();
        });

        it('возвращает ошибку 400 при пустом text', async () => {
            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: '',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(mockedTranslateText).not.toHaveBeenCalled();
        });

        it('возвращает ошибку 400 при text длиннее 5000 символов', async () => {
            const longText = 'a'.repeat(5001);

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: longText,
                    targetLang: 'ru',
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(mockedTranslateText).not.toHaveBeenCalled();
        });

        it('возвращает ошибку 400 при targetLang короче 2 символов', async () => {
            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'e',
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(mockedTranslateText).not.toHaveBeenCalled();
        });

        it('возвращает ошибку 400 при targetLang длиннее 10 символов', async () => {
            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'verylonglang',
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(mockedTranslateText).not.toHaveBeenCalled();
        });

        it('возвращает ошибку 500 при отсутствии API ключа', async () => {
            mockedTranslateText.mockRejectedValue(
                new Error('GOOGLE_TRANSLATE API key is not configured')
            );

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toBe('Translation service is not configured');
        });

        it('возвращает ошибку 500 при ошибке Google Translate API', async () => {
            mockedTranslateText.mockRejectedValue(
                new Error('Google Translate API error: Rate limit exceeded')
            );

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('Google Translate API error');
        });

        it('возвращает ошибку 500 при общей ошибке перевода', async () => {
            mockedTranslateText.mockRejectedValue(
                new Error('Failed to translate text')
            );

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toBe('Failed to translate text');
        });

        it('возвращает ошибку 500 при неизвестной ошибке', async () => {
            mockedTranslateText.mockRejectedValue('Unknown error');

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toBe('Internal server error');
        });

        it('корректно обрабатывает перевод с пробелами', async () => {
            mockedTranslateText.mockResolvedValue({
                translatedText: 'привет мир',
                detectedSourceLanguage: 'en',
            });

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'hello world',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(200);
            expect(res.body.translatedText).toBe('привет мир');
        });

        it('корректно обрабатывает специальные символы', async () => {
            mockedTranslateText.mockResolvedValue({
                translatedText: 'Привет! Как дела?',
                detectedSourceLanguage: 'en',
            });

            const res = await request(fastify.server)
                .post('/translate')
                .set('Cookie', authCookie)
                .send({
                    text: 'Hello! How are you?',
                    targetLang: 'ru',
                });

            expect(res.status).toBe(200);
            expect(res.body.translatedText).toBe('Привет! Как дела?');
        });

        it('работает с разными языками', async () => {
            const testCases = [
                { targetLang: 'en', expected: 'hello' },
                { targetLang: 'ru', expected: 'привет' },
                { targetLang: 'de', expected: 'hallo' },
                { targetLang: 'fr', expected: 'bonjour' },
            ];

            for (const testCase of testCases) {
                mockedTranslateText.mockResolvedValue({
                    translatedText: testCase.expected,
                    detectedSourceLanguage: 'en',
                });

                const res = await request(fastify.server)
                    .post('/translate')
                    .set('Cookie', authCookie)
                    .send({
                        text: 'hello',
                        targetLang: testCase.targetLang,
                    });

                expect(res.status).toBe(200);
                expect(res.body.translatedText).toBe(testCase.expected);
            }
        });
    });
});
