import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import jsonwebtoken from 'jsonwebtoken';
import { AdminService, AdminActionForbiddenError, AdminTargetNotFoundError } from '../../../application/admin-service';
import { IMPERSONATION_COOKIE } from './auth-decorators';

const IMPERSONATION_TTL_SECONDS = 60 * 60; // 1 hour

export function registerAdminRoutes(
    fastify: FastifyInstance,
    adminService: AdminService
) {
    /**
     * Список пользователей с агрегатами
     */
    fastify.get('/admin/users', {
        preHandler: [fastify.requireAdmin],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    search: { type: 'string' },
                    limit: { type: 'integer', minimum: 1, maximum: 200 },
                    offset: { type: 'integer', minimum: 0 },
                    sort: { type: 'string', enum: ['createdAt', 'lastLoginAt', 'email'] },
                    sortDirection: { type: 'string', enum: ['asc', 'desc'] },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        rows: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    email: { type: 'string' },
                                    name: { type: ['string', 'null'] },
                                    createdAt: { type: 'string', format: 'date-time' },
                                    lastLoginAt: { type: ['string', 'null'], format: 'date-time' },
                                    isGuest: { type: 'boolean' },
                                    isAdmin: { type: 'boolean' },
                                    foldersCount: { type: 'integer' },
                                    cardsCount: { type: 'integer' },
                                },
                            },
                        },
                        total: { type: 'integer' },
                    },
                },
            },
            tags: ['admin'],
            summary: 'List users with aggregated stats (admin only)',
        },
    }, async (req) => {
        const query = z.object({
            search: z.string().trim().optional(),
            limit: z.coerce.number().int().min(1).max(200).default(50),
            offset: z.coerce.number().int().min(0).default(0),
            sort: z.enum(['createdAt', 'lastLoginAt', 'email']).default('createdAt'),
            sortDirection: z.enum(['asc', 'desc']).default('desc'),
        }).parse(req.query);

        const result = await adminService.listUsers(query);
        return {
            rows: result.rows.map((row) => ({
                id: row.id,
                email: row.email,
                name: row.name,
                createdAt: row.createdAt.toISOString(),
                lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
                isGuest: row.isGuest,
                isAdmin: row.isAdmin,
                foldersCount: row.foldersCount,
                cardsCount: row.cardsCount,
            })),
            total: result.total,
        };
    });

    /**
     * Детальная статистика по пользователю
     */
    fastify.get('/admin/users/:id/stats', {
        preHandler: [fastify.requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } },
            },
            tags: ['admin'],
            summary: 'Get detailed user stats (admin only)',
        },
    }, async (req, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(req.params);
        try {
            const stats = await adminService.getUserStats(params.id);
            return {
                id: stats.id,
                email: stats.email,
                name: stats.name,
                createdAt: stats.createdAt.toISOString(),
                lastLoginAt: stats.lastLoginAt ? stats.lastLoginAt.toISOString() : null,
                isGuest: stats.isGuest,
                isAdmin: stats.isAdmin,
                language: stats.language,
                oauthProvider: stats.oauthProvider,
                foldersCount: stats.foldersCount,
                cardsCount: stats.cardsCount,
                learnedCardsCount: stats.learnedCardsCount,
            };
        } catch (err) {
            if (err instanceof AdminTargetNotFoundError) {
                return reply.code(404).send({ error: 'User not found' });
            }
            throw err;
        }
    });

    /**
     * Удаление пользователя со всеми связанными данными
     */
    fastify.delete('/admin/users/:id', {
        preHandler: [fastify.requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } },
            },
            tags: ['admin'],
            summary: 'Delete user (admin only)',
        },
    }, async (req, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(req.params);
        const adminUserId = req.adminUserId!;
        try {
            await adminService.deleteUser(adminUserId, params.id);
            return reply.send({ ok: true });
        } catch (err) {
            if (err instanceof AdminActionForbiddenError) {
                return reply.code(403).send({ error: err.message });
            }
            if (err instanceof AdminTargetNotFoundError) {
                return reply.code(404).send({ error: 'User not found' });
            }
            throw err;
        }
    });

    /**
     * Войти как пользователь (impersonation)
     */
    fastify.post('/admin/users/:id/impersonate', {
        preHandler: [fastify.requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } },
            },
            tags: ['admin'],
            summary: 'Start impersonation as user (admin only)',
        },
    }, async (req, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(req.params);
        const adminUserId = req.adminUserId!;

        try {
            await adminService.assertCanImpersonate(adminUserId, params.id);
        } catch (err) {
            if (err instanceof AdminActionForbiddenError) {
                return reply.code(403).send({ error: err.message });
            }
            if (err instanceof AdminTargetNotFoundError) {
                return reply.code(404).send({ error: 'User not found' });
            }
            throw err;
        }

        const token = jsonwebtoken.sign(
            {
                userId: params.id,
                impersonatedBy: adminUserId,
                type: 'impersonation',
            },
            process.env.JWT_SECRET!,
            { expiresIn: IMPERSONATION_TTL_SECONDS }
        );

        await adminService.logImpersonationStart(adminUserId, params.id);

        return reply
            .setCookie(IMPERSONATION_COOKIE, token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                maxAge: IMPERSONATION_TTL_SECONDS,
            })
            .send({ ok: true });
    });

    /**
     * Завершить impersonation
     */
    fastify.post('/admin/impersonate/stop', {
        preHandler: [fastify.requireAdmin],
        schema: {
            tags: ['admin'],
            summary: 'Stop impersonation (admin only)',
        },
    }, async (req, reply) => {
        const adminUserId = req.adminUserId!;
        const impersonationToken = req.cookies?.[IMPERSONATION_COOKIE];
        let impersonatedTargetId: string | null = null;
        if (impersonationToken) {
            try {
                const decoded: any = jsonwebtoken.verify(
                    impersonationToken,
                    process.env.JWT_SECRET!
                );
                impersonatedTargetId = decoded?.userId ?? null;
            } catch {
                impersonatedTargetId = null;
            }
        }

        await adminService.logImpersonationStop(adminUserId, impersonatedTargetId);

        return reply
            .clearCookie(IMPERSONATION_COOKIE, { path: '/' })
            .send({ ok: true });
    });
}
