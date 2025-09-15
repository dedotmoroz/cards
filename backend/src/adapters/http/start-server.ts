// src/adapters/http/start-server.ts
import { buildServer } from './build-server';

async function main() {
    const fastify = await buildServer();

    fastify.listen({ port: 3000 }, (err, address) => {
        if (err) {
            // @ts-ignore
            fastify.log.error(err);
            process.exit(1);
        }
        console.log(`🚀 Fastify API listening at ${address}`);
    });
}

main();