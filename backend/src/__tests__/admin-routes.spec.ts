import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import { buildServer } from '../adapters/http/build-server';
import { db } from '../db/db';
import { adminAuditLog, adminUsers, users } from '../db/schema';

jest.mock('../lib/turnstile', () => ({
    verifyTurnstileToken: jest.fn().mockResolvedValue(true),
}));

const adminEmail = 'admin-routes-test@example.com';
const userEmail = 'user-routes-test@example.com';
const password = 'securePassword123';

function extractCookie(header: string | string[] | undefined, name: string): string | undefined {
    if (!header) return undefined;
    const arr = Array.isArray(header) ? header : [header];
    const found = arr.find((c) => c.startsWith(`${name}=`));
    return found?.split(';')[0];
}

async function registerUser(fastify: FastifyInstance, email: string) {
    const res = await request(fastify.server)
        .post('/auth/register')
        .send({ email, password, turnstileToken: 'ok' });
    expect(res.status).toBe(201);
    const tokenCookie = extractCookie(res.headers['set-cookie'], 'token');
    expect(tokenCookie).toBeDefined();
    return { id: res.body.id as string, tokenCookie: tokenCookie! };
}

async function makeAdmin(userId: string) {
    await db
        .insert(adminUsers)
        .values({ userId })
        .onConflictDoNothing();
}

async function cleanup(emails: string[]) {
    for (const email of emails) {
        const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
        for (const row of rows) {
            await db.delete(adminAuditLog).where(eq(adminAuditLog.adminUserId, row.id));
            await db.delete(adminAuditLog).where(eq(adminAuditLog.targetUserId, row.id));
            await db.delete(adminUsers).where(eq(adminUsers.userId, row.id));
            await db.delete(users).where(eq(users.id, row.id));
        }
    }
}

describe('Admin Routes', () => {
    let fastify: FastifyInstance;

    beforeAll(async () => {
        fastify = await buildServer();
        await fastify.listen({ port: 0 });
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(async () => {
        await cleanup([adminEmail, userEmail]);
    });

    afterAll(async () => {
        await cleanup([adminEmail, userEmail]);
    });

    it('returns 401 without token on /admin/users', async () => {
        const res = await request(fastify.server).get('/admin/users');
        expect(res.status).toBe(401);
    });

    it('returns 403 for authenticated non-admin', async () => {
        const { tokenCookie } = await registerUser(fastify, userEmail);
        const res = await request(fastify.server)
            .get('/admin/users')
            .set('Cookie', tokenCookie);
        expect(res.status).toBe(403);
    });

    it('returns user list for admin', async () => {
        const admin = await registerUser(fastify, adminEmail);
        const target = await registerUser(fastify, userEmail);
        await makeAdmin(admin.id);

        const res = await request(fastify.server)
            .get('/admin/users?limit=100')
            .set('Cookie', admin.tokenCookie);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('rows');
        expect(res.body).toHaveProperty('total');
        const emails = res.body.rows.map((r: any) => r.email);
        expect(emails).toContain(adminEmail);
        expect(emails).toContain(userEmail);

        const adminRow = res.body.rows.find((r: any) => r.email === adminEmail);
        expect(adminRow.isAdmin).toBe(true);
        const targetRow = res.body.rows.find((r: any) => r.email === userEmail);
        expect(targetRow.isAdmin).toBe(false);
        expect(typeof targetRow.foldersCount).toBe('number');
        expect(typeof targetRow.cardsCount).toBe('number');
        // sanity: silence "target" used
        expect(target.id).toBeDefined();
    });

    it('forbids deleting an admin', async () => {
        const admin1 = await registerUser(fastify, adminEmail);
        const admin2 = await registerUser(fastify, userEmail);
        await makeAdmin(admin1.id);
        await makeAdmin(admin2.id);

        const res = await request(fastify.server)
            .delete(`/admin/users/${admin2.id}`)
            .set('Cookie', admin1.tokenCookie);
        expect(res.status).toBe(403);
    });

    it('forbids deleting yourself', async () => {
        const admin = await registerUser(fastify, adminEmail);
        await makeAdmin(admin.id);

        const res = await request(fastify.server)
            .delete(`/admin/users/${admin.id}`)
            .set('Cookie', admin.tokenCookie);
        expect(res.status).toBe(403);
    });

    it('starts impersonation, sets cookie and stops it', async () => {
        const admin = await registerUser(fastify, adminEmail);
        const target = await registerUser(fastify, userEmail);
        await makeAdmin(admin.id);

        const startRes = await request(fastify.server)
            .post(`/admin/users/${target.id}/impersonate`)
            .set('Cookie', admin.tokenCookie);
        expect(startRes.status).toBe(200);
        const impCookie = extractCookie(startRes.headers['set-cookie'], 'impersonation_token');
        expect(impCookie).toBeDefined();

        // /auth/me с impersonation_token + admin token должен вернуть target user и admin id в impersonatedBy
        const meRes = await request(fastify.server)
            .get('/auth/me')
            .set('Cookie', [admin.tokenCookie, impCookie!].join('; '));
        expect(meRes.status).toBe(200);
        expect(meRes.body.id).toBe(target.id);
        expect(meRes.body.impersonatedBy).toBe(admin.id);
        expect(meRes.body.isAdmin).toBe(false);

        const stopRes = await request(fastify.server)
            .post('/admin/impersonate/stop')
            .set('Cookie', [admin.tokenCookie, impCookie!].join('; '));
        expect(stopRes.status).toBe(200);
    });

    it('forbids impersonating an admin', async () => {
        const admin = await registerUser(fastify, adminEmail);
        const otherAdmin = await registerUser(fastify, userEmail);
        await makeAdmin(admin.id);
        await makeAdmin(otherAdmin.id);

        const res = await request(fastify.server)
            .post(`/admin/users/${otherAdmin.id}/impersonate`)
            .set('Cookie', admin.tokenCookie);
        expect(res.status).toBe(403);
    });
});
