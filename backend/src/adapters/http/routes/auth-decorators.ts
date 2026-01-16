import { FastifyInstance } from 'fastify';

/**
 * Регистрирует декораторы аутентификации для Fastify
 */
export function registerAuthDecorators(fastify: FastifyInstance) {
    // ✅ Декоратор для получения текущего пользователя
    fastify.decorate(
        'authenticate',
        async function (request: any, reply: any) {
            try {
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
}
