import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request = require('supertest');

describe('Fastify API', () => {
    let fastify: FastifyInstance;

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });
    });

    afterAll(async () => {
        await fastify.close();
    });

    it('создает папку', async () => {
        const res = await request(fastify.server)
            .post('/folders')
            .send({ userId: 'u1', name: 'New Folder' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('New Folder');
    });

    it('создает карточку', async () => {
        const folderRes = await request(fastify.server)
            .post('/folders')
            .send({ userId: 'u1', name: 'Words' });

        const folderId = folderRes.body.id;

        const res = await request(fastify.server)
            .post('/cards')
            .send({ folderId, question: 'cat', answer: 'кот' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.question).toBe('cat');
    });
});
