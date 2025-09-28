import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from 'supertest';

describe('📁 Folder API (e2e)', () => {
  let fastify: FastifyInstance;
  let authCookie: string;
  let userId: string;
  let createdFolderId: string;

  beforeAll(async () => {
    fastify = await buildServer();
    await fastify.listen({ port: 0 });

    // 1. Регистрация
    await request(fastify.server)
        .post('/auth/register')
        .send({ email: 'testfolder@example.com', password: '123456' });

    // 2. Логин
    const loginRes = await request(fastify.server)
        .post('/auth/login')
        .send({ email: 'testfolder@example.com', password: '123456' });

    authCookie = loginRes.headers['set-cookie'][0];

    // 3. Получаем userId через /auth/me
    const meRes = await request(fastify.server)
        .get('/auth/me')
        .set('Cookie', authCookie);

    userId = meRes.body.id;
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('создаёт папку', async () => {
    const res = await request(fastify.server)
        .post('/folders')
        .set('Cookie', authCookie)
        .send({ userId, name: 'Test Folder' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Folder');
    expect(res.body.userId).toBe(userId);

    createdFolderId = res.body.id;
  });

  it('возвращает список папок пользователя', async () => {
    const res = await request(fastify.server)
        .get(`/folders/${userId}`)
        .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((f: any) => f.id === createdFolderId)).toBe(true);
  });

  it('удаляет папку', async () => {
    const res = await request(fastify.server)
        .delete(`/folders/${createdFolderId}`)
        .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('удалённая папка больше не возвращается', async () => {
    const res = await request(fastify.server)
        .get(`/folders/${userId}`)
        .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.find((f: any) => f.id === createdFolderId)).toBeUndefined();
  });
});