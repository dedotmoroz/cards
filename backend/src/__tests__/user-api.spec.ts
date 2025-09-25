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
    });

    it('входит с правильным паролем', async () => {
        await request(fastify.server)
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword });

        const res = await request(fastify.server)
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(res.status).toBe(200);
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(10);
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
});