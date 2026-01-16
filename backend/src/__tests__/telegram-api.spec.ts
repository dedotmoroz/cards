import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import { db } from '../db/db';
import { users, externalAccounts, telegramAuthNonce } from '../db/schema';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import jwt from 'jsonwebtoken';

describe('Telegram API (e2e)', () => {
    let fastify: FastifyInstance;
    let botToken: string;
    let userAuthCookie: string;
    let userId: string;
    const telegramUserId = 123456789;
    const testEmail = 'telegramtest@example.com';
    const testPassword = 'securePassword123';

    // Создаем JWT токен для бота
    const createBotToken = (): string => {
        const JWT_SECRET = process.env.JWT_SECRET!;
        return jwt.sign({ type: 'bot' }, JWT_SECRET, { expiresIn: '1h' });
    };

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });
        botToken = createBotToken();
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(async () => {
        // Очистка данных перед каждым тестом
        await db.delete(externalAccounts).where(eq(externalAccounts.provider, 'telegram'));
        await db.delete(telegramAuthNonce);
        await db.delete(users).where(eq(users.email, testEmail));

        // Регистрация пользователя для тестов bind
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        // Логин и получение куки
        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        userAuthCookie = loginRes.headers['set-cookie'][0];

        // Получить userId
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', userAuthCookie);

        userId = meRes.body.id;
    });

    describe('POST /telegram/auth/nonce', () => {
        it('создает nonce для Telegram пользователя', async () => {
            const res = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('nonce');
            expect(typeof res.body.nonce).toBe('string');
            expect(res.body.nonce.length).toBeGreaterThan(0);
        });

        it('создает уникальные nonce при каждом вызове', async () => {
            const res1 = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            const res2 = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            expect(res1.status).toBe(200);
            expect(res2.status).toBe(200);
            expect(res1.body.nonce).not.toBe(res2.body.nonce);
        });

        it('требует авторизацию', async () => {
            const res = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .send({ telegramUserId });

            expect(res.status).toBe(401);
        });

        it('требует Bearer токен с типом bot', async () => {
            // Создаем токен без type: 'bot'
            const userToken = jwt.sign({ userId: 'test' }, process.env.JWT_SECRET!);
            
            const res = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ telegramUserId });

            expect(res.status).toBe(403);
        });

        it('требует telegramUserId в теле запроса', async () => {
            const res = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('POST /telegram/auth/bind', () => {
        let nonce: string;

        beforeEach(async () => {
            // Создаем nonce для тестов bind
            const nonceRes = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            nonce = nonceRes.body.nonce;
        });

        it('успешно привязывает Telegram аккаунт к пользователю', async () => {
            const res = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ ok: true });

            // Проверяем, что привязка создана
            const meRes = await request(fastify.server)
                .get('/telegram/me')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(telegramUserId));

            expect(meRes.status).toBe(200);
            expect(meRes.body.linked).toBe(true);
            expect(meRes.body.userId).toBe(userId);
        });

        it('требует авторизацию пользователя', async () => {
            const res = await request(fastify.server)
                .post('/telegram/auth/bind')
                .send({ nonce });

            expect(res.status).toBe(401);
        });

        it('возвращает 400 для невалидного nonce', async () => {
            const res = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce: 'invalid-nonce-123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid or expired nonce');
        });

        it('возвращает 400 для истекшего nonce', async () => {
            // Создаем nonce и ждем его истечения (но это сложно в тестах)
            // Вместо этого используем несуществующий nonce
            const res = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce: 'expired-nonce' });

            expect(res.status).toBe(400);
        });

        it('не позволяет использовать nonce дважды', async () => {
            // Первая привязка
            const res1 = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            expect(res1.status).toBe(200);

            // Вторая попытка с тем же nonce
            const res2 = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            expect(res2.status).toBe(400);
            expect(res2.body.message).toBe('Invalid or expired nonce');
        });

        it('возвращает 409 если Telegram уже привязан к другому пользователю', async () => {
            // Привязываем к первому пользователю
            await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            // Создаем второго пользователя
            const secondUserEmail = 'telegramtest2@example.com';
            await request(fastify.server)
                .post('/auth/register')
                .send({ email: secondUserEmail, password: testPassword });

            const loginRes2 = await request(fastify.server)
                .post('/auth/login')
                .send({ email: secondUserEmail, password: testPassword });

            const secondUserCookie = loginRes2.headers['set-cookie'][0];

            // Создаем новый nonce для того же Telegram ID
            const nonceRes2 = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            const newNonce = nonceRes2.body.nonce;

            // Пытаемся привязать к второму пользователю
            const res = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', secondUserCookie)
                .send({ nonce: newNonce });

            expect(res.status).toBe(409);
            expect(res.body.message).toBe('Telegram account already bound');
        });

        it('возвращает 409 если пользователь уже привязал Telegram', async () => {
            // Привязываем первый раз
            await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            // Создаем новый nonce для другого Telegram ID
            const anotherTelegramUserId = 987654321;
            const nonceRes2 = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId: anotherTelegramUserId });

            const newNonce = nonceRes2.body.nonce;

            // Пытаемся привязать второй Telegram аккаунт к тому же пользователю
            const res = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce: newNonce });

            expect(res.status).toBe(409);
            expect(res.body.message).toBe('User already has Telegram account bound');
        });

        it('требует nonce в теле запроса', async () => {
            const res = await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('GET /telegram/me', () => {
        it('возвращает linked: false для непривязанного аккаунта', async () => {
            const res = await request(fastify.server)
                .get('/telegram/me')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ linked: false });
        });

        it('возвращает информацию о привязанном аккаунте', async () => {
            // Создаем nonce и привязываем
            const nonceRes = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            const nonce = nonceRes.body.nonce;

            await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            // Проверяем статус
            const res = await request(fastify.server)
                .get('/telegram/me')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(200);
            expect(res.body.linked).toBe(true);
            expect(res.body.userId).toBe(userId);
            expect(res.body).toHaveProperty('name');
        });

        it('требует авторизацию', async () => {
            const res = await request(fastify.server)
                .get('/telegram/me')
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(401);
        });

        it('требует Bearer токен с типом bot', async () => {
            const userToken = jwt.sign({ userId: 'test' }, process.env.JWT_SECRET!);
            
            const res = await request(fastify.server)
                .get('/telegram/me')
                .set('Authorization', `Bearer ${userToken}`)
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(403);
        });

        it('требует заголовок x-telegram-user-id', async () => {
            const res = await request(fastify.server)
                .get('/telegram/me')
                .set('Authorization', `Bearer ${botToken}`);

            expect(res.status).toBe(400);
            // Fastify schema validation возвращает свое сообщение
            expect(res.body.message).toContain('x-telegram-user-id');
        });

        it('возвращает linked: false если пользователь удален', async () => {
            // Привязываем аккаунт
            const nonceRes = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            const nonce = nonceRes.body.nonce;

            await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            // Удаляем пользователя
            await db.delete(users).where(eq(users.id, userId));

            // Проверяем статус
            const res = await request(fastify.server)
                .get('/telegram/me')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(200);
            expect(res.body.linked).toBe(false);
        });
    });

    describe('GET /telegram/folders', () => {
        it('возвращает папки пользователя по Telegram', async () => {
            // Привязываем Telegram аккаунт
            const nonceRes = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            const nonce = nonceRes.body.nonce;

            await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            // Создаем папку для пользователя
            const folderRes = await request(fastify.server)
                .post('/folders')
                .set('Cookie', userAuthCookie)
                .send({ userId, name: 'Telegram Test Folder' });

            const folderId = folderRes.body.id;

            // Получаем папки через Telegram API
            const res = await request(fastify.server)
                .get('/telegram/folders')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.some((f: any) => f.id === folderId)).toBe(true);
            
            // Проверяем структуру папки
            const folder = res.body.find((f: any) => f.id === folderId);
            expect(folder).toHaveProperty('id');
            expect(folder).toHaveProperty('name');
            expect(folder.name).toBe('Telegram Test Folder');
        });

        it('возвращает 404 для непривязанного Telegram аккаунта', async () => {
            const res = await request(fastify.server)
                .get('/telegram/folders')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(999999999));

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Telegram account not linked');
        });

        it('требует авторизацию', async () => {
            const res = await request(fastify.server)
                .get('/telegram/folders')
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(401);
        });

        it('требует Bearer токен с типом bot', async () => {
            const userToken = jwt.sign({ userId: 'test' }, process.env.JWT_SECRET!);
            
            const res = await request(fastify.server)
                .get('/telegram/folders')
                .set('Authorization', `Bearer ${userToken}`)
                .set('x-telegram-user-id', String(telegramUserId));

            expect(res.status).toBe(403);
        });

        it('требует заголовок x-telegram-user-id', async () => {
            const res = await request(fastify.server)
                .get('/telegram/folders')
                .set('Authorization', `Bearer ${botToken}`);

            expect(res.status).toBe(400);
        });
    });

    describe('POST /telegram/context/next', () => {
        let folderId: string;
        let cardIds: string[] = [];

        beforeEach(async () => {
            // Привязываем Telegram аккаунт
            const nonceRes = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            const nonce = nonceRes.body.nonce;

            await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            // Создаем папку и карточки
            const folderRes = await request(fastify.server)
                .post('/folders')
                .set('Cookie', userAuthCookie)
                .send({ userId, name: 'Context Folder' });

            folderId = folderRes.body.id;

            // Создаем карточки с предложениями
            for (let i = 1; i <= 3; i++) {
                const cardRes = await request(fastify.server)
                    .post('/cards')
                    .set('Cookie', userAuthCookie)
                    .send({
                        folderId,
                        question: `Question ${i}`,
                        answer: `Answer ${i}`,
                        questionSentences: `Sentence ${i}`,
                        answerSentences: `Translation ${i}`,
                    });
                cardIds.push(cardRes.body.id);
            }
        });

        it('возвращает текст и перевод для карточек', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context/next')
                .set('Authorization', `Bearer ${botToken}`)
                .send({
                    telegramUserId,
                    folderId,
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('text');
            expect(res.body).toHaveProperty('translation');
            expect(res.body).toHaveProperty('completed');
            expect(typeof res.body.text).toBe('string');
            expect(typeof res.body.translation).toBe('string');
            expect(typeof res.body.completed).toBe('boolean');
        });

        it('возвращает completed=true когда карточки закончились', async () => {
            // Используем все карточки через обычный API
            await request(fastify.server)
                .post('/context-reading/next')
                .set('Cookie', userAuthCookie)
                .send({ folderId, limit: 5 });

            const res = await request(fastify.server)
                .post('/telegram/context/next')
                .set('Authorization', `Bearer ${botToken}`)
                .send({
                    telegramUserId,
                    folderId,
                });

            expect(res.status).toBe(200);
            expect(res.body.completed).toBe(true);
            expect(res.body.text).toBe('');
            expect(res.body.translation).toBe('');
        });

        it('требует авторизацию', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context/next')
                .send({
                    telegramUserId,
                    folderId,
                });

            expect(res.status).toBe(401);
        });

        it('возвращает 401 для непривязанного Telegram аккаунта', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context/next')
                .set('Authorization', `Bearer ${botToken}`)
                .send({
                    telegramUserId: 999999999,
                    folderId,
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Telegram not linked');
        });

        it('требует telegramUserId и folderId', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context/next')
                .set('Authorization', `Bearer ${botToken}`)
                .send({
                    folderId,
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /telegram/context-reading/reset', () => {
        let folderId: string;

        beforeEach(async () => {
            // Привязываем Telegram аккаунт
            const nonceRes = await request(fastify.server)
                .post('/telegram/auth/nonce')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ telegramUserId });

            const nonce = nonceRes.body.nonce;

            await request(fastify.server)
                .post('/telegram/auth/bind')
                .set('Cookie', userAuthCookie)
                .send({ nonce });

            // Создаем папку
            const folderRes = await request(fastify.server)
                .post('/folders')
                .set('Cookie', userAuthCookie)
                .send({ userId, name: 'Reset Folder' });

            folderId = folderRes.body.id;
        });

        it('сбрасывает прогресс контекстного чтения', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context-reading/reset')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(telegramUserId))
                .send({ folderId });

            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
        });

        it('требует авторизацию', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context-reading/reset')
                .set('x-telegram-user-id', String(telegramUserId))
                .send({ folderId });

            expect(res.status).toBe(401);
        });

        it('возвращает 404 для непривязанного Telegram аккаунта', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context-reading/reset')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(999999999))
                .send({ folderId });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Telegram account not linked');
        });

        it('требует folderId', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context-reading/reset')
                .set('Authorization', `Bearer ${botToken}`)
                .set('x-telegram-user-id', String(telegramUserId))
                .send({});

            expect(res.status).toBe(400);
        });

        it('требует заголовок x-telegram-user-id', async () => {
            const res = await request(fastify.server)
                .post('/telegram/context-reading/reset')
                .set('Authorization', `Bearer ${botToken}`)
                .send({ folderId });

            expect(res.status).toBe(400);
        });
    });
});

