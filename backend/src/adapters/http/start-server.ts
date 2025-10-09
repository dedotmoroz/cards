// src/adapters/http/start-server.ts
import { buildServer } from './build-server';

export async function startServer() {
    const fastify = await buildServer();

    const port = Number(process.env.PORT) || 3000;
    fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            // @ts-ignore
            fastify.log.error(err);
            process.exit(1);
        }
        console.log(`🚀 Fastify API listening at ${address}`);
    });
}

// Автоматически запускаем, если файл запущен напрямую (node start-server.js)
if (process.argv[1]?.endsWith('start-server.js')) {
    startServer();
}