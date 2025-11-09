import "dotenv/config";
import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import registerApi from "./src/routes/api";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
    const app = Fastify({ logger: true });

    await app.register(swagger, {
        openapi: {
            openapi: "3.1.0",
            info: {
                title: "AI Service",
                description: "Asynchronous card generation API",
                version: "1.0.0",
            },
            servers: [
                {
                    url: `http://localhost:${PORT}`,
                    description: "Local development",
                },
            ],
        },
    });

    await app.register(swaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
        },
        staticCSP: true,
    });

    await registerApi(app);

    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`AI service listening on http://localhost:${PORT}`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});