import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from "supertest"

describe('Folder API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = await buildServer();
    await fastify.listen({ port: 0 });
  });

  afterAll(async () => {
    await fastify.close();
  });

  let createdFolderId: string;
  const testUserId = '11111111-1111-1111-1111-111111111111'; // UUID

  it('создаёт папку', async () => {
    const res = await request(fastify.server)
      .post('/folders')
      .send({ userId: testUserId, name: 'Test Folder' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Folder');
    expect(res.body.userId).toBe(testUserId);
    createdFolderId = res.body.id;
  });

  it('возвращает список папок пользователя', async () => {
    const res = await request(fastify.server)
      .get(`/folders/${testUserId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((f: any) => f.id === createdFolderId)).toBe(true);
  });

  it('удаляет папку', async () => {
    const res = await request(fastify.server)
        .delete(`/folders/${createdFolderId}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('удалённая папка больше не возвращается', async () => {
    const res = await request(fastify.server)
        .get(`/folders/${testUserId}`);

    expect(res.status).toBe(200);
    expect(res.body.find((f: any) => f.id === createdFolderId)).toBeUndefined();
  });

});