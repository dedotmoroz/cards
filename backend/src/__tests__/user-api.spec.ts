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
    });

    it('регистрирует пользователя с именем', async () => {
        const res = await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword, name: testName });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(testEmail);
        expect(res.body.name).toBe(testName);
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
        // Регистрируем и логинимся
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(loginRes.status).toBe(200);
        
        // Извлекаем cookie из заголовка
        const setCookieHeader = loginRes.headers['set-cookie'];
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
    });

    it('возвращает текущего пользователя с именем по токену', async () => {
        // Регистрируем с именем и логинимся
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword, name: testName });

        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(loginRes.status).toBe(200);
        
        // Извлекаем cookie из заголовка
        const setCookieHeader = loginRes.headers['set-cookie'];
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
    });

    it('не возвращает текущего пользователя без токена', async () => {
        const res = await request(fastify.server)
            .get('/auth/me');

        expect(res.status).toBe(401);
    });

    it('обновляет имя пользователя', async () => {
        // Регистрируем и логинимся
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(loginRes.status).toBe(200);
        
        // Извлекаем cookie из заголовка
        const setCookieHeader = loginRes.headers['set-cookie'];
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
        // Регистрируем с именем и логинимся
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword, name: 'Old Name' });

        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(loginRes.status).toBe(200);
        
        // Извлекаем cookie из заголовка
        const setCookieHeader = loginRes.headers['set-cookie'];
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
        // Регистрируем и логинимся
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(loginRes.status).toBe(200);
        
        // Извлекаем cookie из заголовка
        const setCookieHeader = loginRes.headers['set-cookie'];
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
});