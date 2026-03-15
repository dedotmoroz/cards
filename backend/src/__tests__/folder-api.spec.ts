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

  it('возвращает список папок пользователя с cardCount', async () => {
    const res = await request(fastify.server)
        .get(`/folders/${userId}`)
        .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const folder = res.body.find((f: any) => f.id === createdFolderId);
    expect(folder).toBeDefined();
    expect(folder).toHaveProperty('cardCount');
    expect(folder.cardCount).toBe(0);
  });

  it('возвращает cardCount равный числу карточек в папке', async () => {
    const folderRes = await request(fastify.server)
        .post('/folders')
        .set('Cookie', authCookie)
        .send({ userId, name: 'Folder With Cards' });
    const folderId = folderRes.body.id;

    await request(fastify.server)
        .post('/cards')
        .set('Cookie', authCookie)
        .send({ folderId, question: 'Q1', answer: 'A1' });
    await request(fastify.server)
        .post('/cards')
        .set('Cookie', authCookie)
        .send({ folderId, question: 'Q2', answer: 'A2' });
    await request(fastify.server)
        .post('/cards')
        .set('Cookie', authCookie)
        .send({ folderId, question: 'Q3', answer: 'A3' });

    const listRes = await request(fastify.server)
        .get(`/folders/${userId}`)
        .set('Cookie', authCookie);

    const folder = listRes.body.find((f: any) => f.id === folderId);
    expect(folder).toBeDefined();
    expect(folder.cardCount).toBe(3);
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

  it('переименовывает папку', async () => {
    // Создаем папку для переименования
    const folderRes = await request(fastify.server)
        .post('/folders')
        .set('Cookie', authCookie)
        .send({ userId, name: 'Original Name' });

    const folderId = folderRes.body.id;

    // Переименовываем
    const renameRes = await request(fastify.server)
        .patch(`/folders/${folderId}`)
        .set('Cookie', authCookie)
        .send({ name: 'New Name' });

    expect(renameRes.status).toBe(200);
    expect(renameRes.body.name).toBe('New Name');
    expect(renameRes.body.id).toBe(folderId);

    // Проверяем, что имя действительно изменилось
    const getRes = await request(fastify.server)
        .get(`/folders/${userId}`)
        .set('Cookie', authCookie);

    const renamedFolder = getRes.body.find((f: any) => f.id === folderId);
    expect(renamedFolder).toBeDefined();
    expect(renamedFolder.name).toBe('New Name');
  });

  it('возвращает 404 при переименовании несуществующей папки', async () => {
    const fakeFolderId = '00000000-0000-0000-0000-000000000000';
    const res = await request(fastify.server)
        .patch(`/folders/${fakeFolderId}`)
        .set('Cookie', authCookie)
        .send({ name: 'New Name' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Folder not found');
  });

  it('требует аутентификации для переименования', async () => {
    const res = await request(fastify.server)
        .patch(`/folders/${createdFolderId}`)
        .send({ name: 'New Name' });

    expect(res.status).toBe(401);
  });

  it('требует поле name для переименования', async () => {
    const res = await request(fastify.server)
        .patch(`/folders/${createdFolderId}`)
        .set('Cookie', authCookie)
        .send({});

    expect(res.status).toBe(400);
  });
});