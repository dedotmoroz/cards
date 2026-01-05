// src/types/fastify.d.ts
import 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
        authenticateService: any;
    }

    interface FastifyRequest {
        user: {
            userId: string;
        };
    }
}