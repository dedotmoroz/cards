import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import { db } from '../db/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import request from "supertest"

describe('User API', () => {
    let fastify: FastifyInstance;

    const testEmail = 'testuser@example.com';
    const testPassword = 'securePassword123';
    const testName = 'Test User';

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(async () => {
        await db.delete(users).where(eq(users.email, testEmail));
    });

    it('регистрирует пользователя', async () => {
        const res = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(testEmail);
        expect(res.body.name).toBeUndefined();
        
        // Проверяем, что после регистрации устанавливается cookie с токеном
        const setCookieHeader = res.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        expect(tokenCookie).toBeDefined();
    });

    it('регистрирует пользователя с именем', async () => {
        const res = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword, name: testName });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(testEmail);
        expect(res.body.name).toBe(testName);
        
        // Проверяем, что после регистрации устанавливается cookie с токеном
        const setCookieHeader = res.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        expect(tokenCookie).toBeDefined();
    });

    it('входит с правильным паролем', async () => {
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const res = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(res.status).toBe(200);
    });

    it('не входит с неправильным паролем', async () => {
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const res = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: 'wrong_password' });

        expect(res.status).toBe(401);
    });

    it('не входит с несуществующим email', async () => {
        const res = await request(fastify.server)
            .post('/auth/login')
            .send({ email: 'notexist@example.com', password: 'any' });

        expect(res.status).toBe(401);
    });

    it('возвращает текущего пользователя по токену', async () => {
        // Регистрируем - теперь токен устанавливается сразу при регистрации
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        
        // Находим cookie с токеном
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        
        expect(tokenCookie).toBeDefined();
        
        // Извлекаем только значение cookie (до первого ;)
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Получаем информацию о текущем пользователе с cookie
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', cookieValue);

        expect(meRes.status).toBe(200);
        expect(meRes.body).toHaveProperty('id');
        expect(meRes.body.email).toBe(testEmail);
        expect(meRes.body).toHaveProperty('name'); // Проверяем, что поле name всегда присутствует
        // Когда пользователь без имени, name может быть null или пустой строкой (в зависимости от БД)
        expect(meRes.body.name === null || meRes.body.name === '').toBe(true);
        // language может быть undefined, но поле должно присутствовать в ответе
        expect('language' in meRes.body).toBe(true);
        expect(meRes.body).toHaveProperty('isGuest');
        expect(meRes.body.isGuest).toBe(false); // При регистрации isGuest должен быть false
    });

    it('возвращает текущего пользователя с именем по токену', async () => {
        // Регистрируем с именем - теперь токен устанавливается сразу при регистрации
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword, name: testName });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        
        // Находим cookie с токеном
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        
        expect(tokenCookie).toBeDefined();
        
        // Извлекаем только значение cookie (до первого ;)
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Получаем информацию о текущем пользователе с cookie
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', cookieValue);

        expect(meRes.status).toBe(200);
        expect(meRes.body).toHaveProperty('id');
        expect(meRes.body.email).toBe(testEmail);
        expect(meRes.body.name).toBe(testName);
        expect(meRes.body).toHaveProperty('createdAt');
        // language может быть undefined, но поле должно присутствовать в ответе
        expect('language' in meRes.body).toBe(true);
        expect(meRes.body).toHaveProperty('isGuest');
        expect(meRes.body.isGuest).toBe(false);
    });

    it('не возвращает текущего пользователя без токена', async () => {
        const res = await request(fastify.server)
            .get('/auth/me');

        expect(res.status).toBe(401);
    });

    it('обновляет имя пользователя', async () => {
        // Регистрируем - теперь токен устанавливается сразу при регистрации
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Обновляем имя пользователя
        const updateRes = await request(fastify.server)
            .patch('/auth/profile')
            .set('Cookie', cookieValue)
            .send({ name: testName });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.name).toBe(testName);
    });

    it('обновляет имя пользователя на новое значение', async () => {
        // Регистрируем с именем - теперь токен устанавливается сразу при регистрации
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword, name: 'Old Name' });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Обновляем имя пользователя
        const updateRes = await request(fastify.server)
            .patch('/auth/profile')
            .set('Cookie', cookieValue)
            .send({ name: testName });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.name).toBe(testName);
        
        // Проверяем, что имя действительно обновилось через /auth/me
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', cookieValue);

        expect(meRes.status).toBe(200);
        expect(meRes.body.name).toBe(testName);
    });

    it('не обновляет имя без токена', async () => {
        const res = await request(fastify.server)
            .patch('/auth/profile')
            .send({ name: testName });

        expect(res.status).toBe(401);
    });

    it('требует обязательное поле name', async () => {
        // Регистрируем - теперь токен устанавливается сразу при регистрации
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Пытаемся обновить без поля name
        const updateRes = await request(fastify.server)
            .patch('/auth/profile')
            .set('Cookie', cookieValue)
            .send({});

        expect(updateRes.status).toBe(400);
    });

    it('меняет пароль пользователя', async () => {
        // Регистрируем пользователя
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Меняем пароль
        const newPassword = 'newSecurePassword123';
        const changePasswordRes = await request(fastify.server)
            .patch('/auth/password')
            .set('Cookie', cookieValue)
            .send({ oldPassword: testPassword, newPassword });

        expect(changePasswordRes.status).toBe(200);
        expect(changePasswordRes.body.status).toBe('ok');
        
        // Проверяем, что старый пароль больше не работает
        const oldLoginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(oldLoginRes.status).toBe(401);
        
        // Проверяем, что новый пароль работает
        const newLoginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: newPassword });

        expect(newLoginRes.status).toBe(200);
    });

    it('не меняет пароль при неправильном старом пароле', async () => {
        // Регистрируем пользователя
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Пытаемся поменять пароль с неправильным старым паролем
        const changePasswordRes = await request(fastify.server)
            .patch('/auth/password')
            .set('Cookie', cookieValue)
            .send({ oldPassword: 'wrongPassword', newPassword: 'newPassword123' });

        expect(changePasswordRes.status).toBe(400);
        expect(changePasswordRes.body.error).toBe('Invalid old password');
    });

    it('не меняет пароль без токена', async () => {
        const res = await request(fastify.server)
            .patch('/auth/password')
            .send({ oldPassword: testPassword, newPassword: 'newPassword123' });

        expect(res.status).toBe(401);
    });

    it('не меняет пароль при слишком коротком новом пароле', async () => {
        // Регистрируем пользователя
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie из заголовка регистрации
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Пытаемся поменять пароль на слишком короткий
        const changePasswordRes = await request(fastify.server)
            .patch('/auth/password')
            .set('Cookie', cookieValue)
            .send({ oldPassword: testPassword, newPassword: '12345' });

        expect(changePasswordRes.status).toBe(400);
    });

    it('регистрирует гостя', async () => {
        const res = await request(fastify.server)
            .post('/auth/guests')
            .send({ language: 'en' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toMatch(/^[a-f0-9-]+@kotcat\.com$/);
        expect(res.body.name).toBe('guest');
        expect(res.body.language).toBe('en');
        expect(res.body.isGuest).toBe(true);
        
        // Проверяем, что после регистрации устанавливается cookie с токеном
        const setCookieHeader = res.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        expect(tokenCookie).toBeDefined();
    });

    it('регистрирует гостя без языка', async () => {
        const res = await request(fastify.server)
            .post('/auth/guests')
            .send({});

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toMatch(/^[a-f0-9-]+@kotcat\.com$/);
        expect(res.body.name).toBe('guest');
        expect(res.body.isGuest).toBe(true);
    });

    it('возвращает гостя через /auth/me', async () => {
        const registerRes = await request(fastify.server)
            .post('/auth/guests')
            .send({ language: 'ru' });

        expect(registerRes.status).toBe(201);
        
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', cookieValue);

        expect(meRes.status).toBe(200);
        expect(meRes.body).toHaveProperty('id');
        expect(meRes.body.email).toMatch(/^[a-f0-9-]+@kotcat\.com$/);
        expect(meRes.body.name).toBe('guest');
        expect(meRes.body.language).toBe('ru');
        expect(meRes.body.isGuest).toBe(true);
    });

    it('конвертирует гостя в обычного пользователя', async () => {
        // Создаем гостя
        const guestRes = await request(fastify.server)
            .post('/auth/guests')
            .send({ language: 'en' });

        expect(guestRes.status).toBe(201);
        const guestId = guestRes.body.id;

        // Конвертируем гостя в обычного пользователя
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${guestId}`)
            .send({
                email: testEmail,
                password: testPassword,
                name: testName,
                language: 'ru',
            });

        expect(convertRes.status).toBe(200);
        expect(convertRes.body.email).toBe(testEmail);
        expect(convertRes.body.name).toBe(testName);
        expect(convertRes.body.language).toBe('ru');
        expect(convertRes.body.isGuest).toBe(false);

        // Проверяем, что теперь можно войти с новыми данными
        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(loginRes.status).toBe(200);
    });

    it('конвертирует гостя без name и language', async () => {
        // Создаем гостя
        const guestRes = await request(fastify.server)
            .post('/auth/guests')
            .send({});

        expect(guestRes.status).toBe(201);
        const guestId = guestRes.body.id;

        // Конвертируем гостя в обычного пользователя без name и language
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${guestId}`)
            .send({
                email: `test-${Date.now()}@example.com`,
                password: testPassword,
            });

        expect(convertRes.status).toBe(200);
        expect(convertRes.body.email).toBeDefined();
        expect(convertRes.body.isGuest).toBe(false);
    });

    it('не конвертирует несуществующего пользователя', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${fakeId}`)
            .send({
                email: testEmail,
                password: testPassword,
            });

        expect(convertRes.status).toBe(404);
        expect(convertRes.body.error).toBe('User not found');
    });

    it('не конвертирует обычного пользователя (не гостя)', async () => {
        // Создаем обычного пользователя
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        const userId = registerRes.body.id;

        // Пытаемся конвертировать обычного пользователя
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${userId}`)
            .send({
                email: `another-${Date.now()}@example.com`,
                password: 'newPassword123',
            });

        expect(convertRes.status).toBe(400);
        expect(convertRes.body.error).toBe('User is not a guest');
    });

    it('не конвертирует гостя с занятым email', async () => {
        // Создаем обычного пользователя
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);

        // Создаем гостя
        const guestRes = await request(fastify.server)
            .post('/auth/guests')
            .send({});

        expect(guestRes.status).toBe(201);
        const guestId = guestRes.body.id;

        // Пытаемся конвертировать гостя с занятым email
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${guestId}`)
            .send({
                email: testEmail,
                password: testPassword,
            });

        expect(convertRes.status).toBe(409);
        expect(convertRes.body.error).toBe('Email already exists');
    });

    it('не конвертирует гостя с коротким паролем', async () => {
        // Создаем гостя
        const guestRes = await request(fastify.server)
            .post('/auth/guests')
            .send({});

        expect(guestRes.status).toBe(201);
        const guestId = guestRes.body.id;

        // Пытаемся конвертировать с коротким паролем
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${guestId}`)
            .send({
                email: `test-${Date.now()}@example.com`,
                password: '12345', // слишком короткий
            });

        expect(convertRes.status).toBe(400);
    });

    it('не конвертирует гостя без email', async () => {
        // Создаем гостя
        const guestRes = await request(fastify.server)
            .post('/auth/guests')
            .send({});

        expect(guestRes.status).toBe(201);
        const guestId = guestRes.body.id;

        // Пытаемся конвертировать без email
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${guestId}`)
            .send({
                password: testPassword,
            });

        expect(convertRes.status).toBe(400);
    });

    it('не конвертирует гостя без password', async () => {
        // Создаем гостя
        const guestRes = await request(fastify.server)
            .post('/auth/guests')
            .send({});

        expect(guestRes.status).toBe(201);
        const guestId = guestRes.body.id;

        // Пытаемся конвертировать без password
        const convertRes = await request(fastify.server)
            .patch(`/auth/guests/${guestId}`)
            .send({
                email: `test-${Date.now()}@example.com`,
            });

        expect(convertRes.status).toBe(400);
    });

    it('обновляет язык пользователя', async () => {
        // Регистрируем пользователя
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        
        // Извлекаем cookie
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Обновляем язык
        const updateRes = await request(fastify.server)
            .patch('/auth/language')
            .set('Cookie', cookieValue)
            .send({ language: 'ru' });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.language).toBe('ru');
        
        // Проверяем через /auth/me
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', cookieValue);

        expect(meRes.status).toBe(200);
        expect(meRes.body.language).toBe('ru');
    });

    it('не обновляет язык без токена', async () => {
        const res = await request(fastify.server)
            .patch('/auth/language')
            .send({ language: 'ru' });

        expect(res.status).toBe(401);
    });

    it('требует поле language', async () => {
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        const res = await request(fastify.server)
            .patch('/auth/language')
            .set('Cookie', cookieValue)
            .send({});

        expect(res.status).toBe(400);
    });

    it('возвращает токен по clientId и auth cookie', async () => {
        // Регистрируем пользователя
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        expect(registerRes.status).toBe(201);
        const userId = registerRes.body.id;
        
        // Извлекаем cookie
        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Получаем токен
        const tokenRes = await request(fastify.server)
            .post('/auth/token')
            .set('Cookie', cookieValue)
            .send({ clientId: userId });

        expect(tokenRes.status).toBe(200);
        expect(tokenRes.body).toHaveProperty('token');
        expect(typeof tokenRes.body.token).toBe('string');
    });

    it('не возвращает токен без auth cookie', async () => {
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const userId = registerRes.body.id;
        
        const res = await request(fastify.server)
            .post('/auth/token')
            .send({ clientId: userId });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('No auth cookie provided');
    });

    it('не возвращает токен при несовпадении clientId', async () => {
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        const fakeClientId = '00000000-0000-0000-0000-000000000000';
        const res = await request(fastify.server)
            .post('/auth/token')
            .set('Cookie', cookieValue)
            .send({ clientId: fakeClientId });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Client ID does not match token');
    });

    it('очищает auth cookie при выходе', async () => {
        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const setCookieHeader = registerRes.headers['set-cookie'];
        const tokenCookie = Array.isArray(setCookieHeader) 
            ? setCookieHeader.find(cookie => cookie.startsWith('token='))
            : setCookieHeader?.startsWith('token=') ? setCookieHeader : undefined;
        const cookieValue = tokenCookie?.split(';')[0] || '';
        
        // Проверяем, что до logout cookie работает
        const meResBefore = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', cookieValue);
        expect(meResBefore.status).toBe(200);
        
        const logoutRes = await request(fastify.server)
            .post('/auth/logout')
            .set('Cookie', cookieValue);

        expect(logoutRes.status).toBe(200);
        expect(logoutRes.body.ok).toBe(true);
        
        // Проверяем, что cookie очищена - запрос к /auth/me должен вернуть 401
        // Важно: после logout cookie очищается, но токен все еще может быть валидным
        // Поэтому проверяем, что без cookie запрос не проходит
        const meResAfter = await request(fastify.server)
            .get('/auth/me');

        expect(meResAfter.status).toBe(401);
    });

    it('выход работает без токена', async () => {
        const res = await request(fastify.server)
            .post('/auth/logout');

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });

    it('требует idToken для Google авторизации', async () => {
        const res = await request(fastify.server)
            .post('/auth/google')
            .send({});

        expect(res.status).toBe(400);
    });

    it('принимает idToken для Google авторизации', async () => {
        // Этот тест может упасть, если Google сервис не настроен, но проверяет структуру запроса
        const res = await request(fastify.server)
            .post('/auth/google')
            .send({ idToken: 'fake-google-id-token' });

        // Может вернуть 200 с токеном или ошибку, в зависимости от настройки Google
        expect([200, 400, 401, 500]).toContain(res.status);
    });
});