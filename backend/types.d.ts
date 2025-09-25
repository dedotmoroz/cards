// src/types/fastify.d.ts
import 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }

    interface FastifyRequest {
        user: {
            userId: string;
        };
    }
}