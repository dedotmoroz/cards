// src/types/fastify.d.ts
import 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
        authenticateService: any;
        requireAdmin: any;
    }

    interface FastifyRequest {
        user: {
            userId: string;
            impersonatedBy?: string;
            type?: string;
        };
        adminUserId?: string;
    }
}