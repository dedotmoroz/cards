import { FastifyInstance } from 'fastify';
import { AdminRepository } from '../../../ports/admin-repository';

export const IMPERSONATION_COOKIE = 'impersonation_token';

/**
 * Регистрирует декораторы аутентификации для Fastify
 */
export function registerAuthDecorators(
    fastify: FastifyInstance,
    adminRepo?: AdminRepository
) {
    // ✅ Декоратор для получения текущего пользователя
    fastify.decorate(
        'authenticate',
        async function (request: any, reply: any) {
            try {
                const impersonationToken = request.cookies?.[IMPERSONATION_COOKIE];
                if (impersonationToken) {
                    try {
                        const payload: any = await request.jwtVerify({
                            token: impersonationToken,
                        });
                        if (payload?.type === 'impersonation' && payload?.userId) {
                            return;
                        }
                    } catch (impErr) {
                        request.log.warn(
                            { err: impErr },
                            'Invalid impersonation token, falling back to user token'
                        );
                    }
                }

                let token: string | undefined;
                const authHeader = request.headers['authorization'] as string | undefined;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.slice(7);
                } else if (request.cookies?.token) {
                    token = request.cookies.token;
                }

                if (!token) {
                    reply.code(401).send({ message: 'Unauthorized' });
                    return;
                }

                await request.jwtVerify({ token });
            } catch (err) {
                request.log.error({ err }, 'Auth failed');
                reply.code(401).send({ message: 'Unauthorized' });
            }
        }
    );

    fastify.decorate(
        'authenticateService',
        async function (request: any, reply: any) {
            try {
                const authHeader = request.headers['authorization'];
                if (!authHeader?.startsWith('Bearer ')) {
                    return reply.code(401).send({ message: 'Unauthorized' });
                }

                const token = authHeader.slice(7);
                const payload = await request.jwtVerify({ token });

                if (payload.type !== 'bot') {
                    return reply.code(403).send({ message: 'Forbidden' });
                }
            } catch (err) {
                request.log.error({ err }, 'Service auth failed');
                reply.code(401).send({ message: 'Unauthorized' });
            }
        }
    );

    /**
     * Декоратор: требует админа.
     * При impersonation использует исходный admin id из payload.impersonatedBy.
     * Иначе берёт userId из обычного токена.
     */
    fastify.decorate(
        'requireAdmin',
        async function (request: any, reply: any) {
            if (!adminRepo) {
                request.log.error('AdminRepository is not configured for requireAdmin');
                return reply.code(500).send({ message: 'Admin not configured' });
            }
            try {
                let token: string | undefined;
                const authHeader = request.headers['authorization'] as string | undefined;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.slice(7);
                } else if (request.cookies?.token) {
                    token = request.cookies.token;
                }

                if (!token) {
                    return reply.code(401).send({ message: 'Unauthorized' });
                }

                const payload: any = await request.jwtVerify({ token });
                const adminUserId: string | undefined = payload?.userId;
                if (!adminUserId) {
                    return reply.code(401).send({ message: 'Unauthorized' });
                }

                const isAdmin = await adminRepo.isAdmin(adminUserId);
                if (!isAdmin) {
                    return reply.code(403).send({ message: 'Forbidden' });
                }

                request.adminUserId = adminUserId;
            } catch (err) {
                request.log.error({ err }, 'Admin auth failed');
                return reply.code(401).send({ message: 'Unauthorized' });
            }
        }
    );
}
