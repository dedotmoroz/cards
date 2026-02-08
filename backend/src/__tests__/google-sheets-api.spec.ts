import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { googleSheetsTokens } from '../db/schema';

const mockVerifyTurnstileToken = jest.fn().mockResolvedValue(true);
jest.mock('../lib/turnstile', () => ({
    verifyTurnstileToken: (token: string) => mockVerifyTurnstileToken(token),
}));

jest.mock('googleapis', () => {
    const valuesGet = jest.fn();
    const create = jest.fn();
    const valuesUpdate = jest.fn();
    (global as any).__googleSheetsApiMocks = { valuesGet, create, valuesUpdate };
    return {
        google: {
            auth: {
                OAuth2: jest.fn().mockImplementation(() => ({
                    setCredentials: jest.fn(),
                })),
            },
            sheets: jest.fn().mockReturnValue({
                spreadsheets: {
                    values: { get: valuesGet, update: valuesUpdate },
                    create,
                },
            }),
        },
    };
});

const getMocks = () => (global as any).__googleSheetsApiMocks as {
    valuesGet: jest.Mock;
    create: jest.Mock;
    valuesUpdate: jest.Mock;
};

describe('Google Sheets API', () => {
    let fastify: FastifyInstance;
    let folderId: string;
    let authCookie: string;
    let userId: string;

    beforeAll(async () => {
        process.env.GOOGLE_CLIENT_ID = 'test-client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

        fastify = await buildServer();
        await fastify.listen({ port: 0 });

        const registerRes = await request(fastify.server)
            .post('/auth/register')
            .send({
                email: 'sheets-test@example.com',
                password: '123456',
                turnstileToken: 'test-token',
            });

        const loginRes = await request(fastify.server)
            .post('/auth/login')
            .send({ email: 'sheets-test@example.com', password: '123456' });

        authCookie = loginRes.headers['set-cookie']?.[0] ?? '';

        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', authCookie);
        userId = meRes.body.id;

        const folderRes = await request(fastify.server)
            .post('/folders')
            .set('Cookie', authCookie)
            .send({ userId, name: 'Sheets Test Folder' });
        folderId = folderRes.body.id;

        const futureExpiry = new Date(Date.now() + 3600 * 1000);
        await db.insert(googleSheetsTokens).values({
            user_id: userId,
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_at: futureExpiry,
        });
    });

    afterAll(async () => {
        delete process.env.GOOGLE_CLIENT_ID;
        delete process.env.GOOGLE_CLIENT_SECRET;
        await db.delete(googleSheetsTokens).where(eq(googleSheetsTokens.user_id, userId));
        await fastify.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /auth/google/sheets/status', () => {
        it('возвращает connected: true когда токены есть', async () => {
            const res = await request(fastify.server)
                .get('/auth/google/sheets/status')
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ connected: true });
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .get('/auth/google/sheets/status');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /cards/folder/:folderId/import/google', () => {
        beforeEach(() => {
            getMocks().valuesGet.mockResolvedValue({
                data: {
                    values: [
                        ['Сторона A', 'Сторона B'],
                        ['Imported Q1', 'Imported A1'],
                        ['Imported Q2', 'Imported A2'],
                    ],
                },
            });
        });

        it('импортирует карточки из Google Sheets', async () => {
            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/import/google`)
                .set('Cookie', authCookie)
                .send({
                    spreadsheetId: 'test-spreadsheet-id',
                    sheetName: 'Sheet1',
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Import completed');
            expect(res.body.successCount).toBe(2);
            expect(getMocks().valuesGet).toHaveBeenCalledWith({
                spreadsheetId: 'test-spreadsheet-id',
                range: 'Sheet1!A:Z',
            });
        });

        it('возвращает 400 при отсутствии spreadsheetId', async () => {
            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/import/google`)
                .set('Cookie', authCookie)
                .send({});

            expect(res.status).toBe(400);
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/import/google`)
                .send({ spreadsheetId: 'id' });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /cards/folder/:folderId/export/google', () => {
        beforeEach(() => {
            getMocks().create.mockResolvedValue({
                data: { spreadsheetId: 'new-spreadsheet-id' },
            });
            getMocks().valuesUpdate.mockResolvedValue({});
        });

        it('экспортирует карточки в Google Sheets', async () => {
            await request(fastify.server)
                .post('/cards')
                .set('Cookie', authCookie)
                .send({
                    folderId,
                    question: 'Export Q',
                    answer: 'Export A',
                });

            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/export/google`)
                .set('Cookie', authCookie)
                .send({ title: 'Exported Cards' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('spreadsheetUrl');
            expect(res.body.spreadsheetUrl).toContain('new-spreadsheet-id');
            expect(res.body.spreadsheetId).toBe('new-spreadsheet-id');
            expect(getMocks().create).toHaveBeenCalled();
            expect(getMocks().valuesUpdate).toHaveBeenCalled();
        });

        it('требует аутентификации', async () => {
            const res = await request(fastify.server)
                .post(`/cards/folder/${folderId}/export/google`)
                .send({});

            expect(res.status).toBe(401);
        });

        it('возвращает 404 для несуществующей папки', async () => {
            const fakeFolderId = '00000000-0000-0000-0000-000000000000';
            const res = await request(fastify.server)
                .post(`/cards/folder/${fakeFolderId}/export/google`)
                .set('Cookie', authCookie)
                .send({});

            expect(res.status).toBe(404);
        });
    });
});
