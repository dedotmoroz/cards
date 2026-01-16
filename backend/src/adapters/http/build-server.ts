/**
 * src/adapters/http/build-server.ts
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import * as dotenv from 'dotenv';
import cookie from '@fastify/cookie';
dotenv.config();

import { CardService } from '../../application/card-service';
import { FolderService } from '../../application/folder-service';
import { UserService } from '../../application/user-service';
import { PostgresCardRepository } from '../db/postgres-card-repo';
import { PostgresFolderRepository } from '../db/postgres-folder-repo';
import { PostgresUserRepository } from '../db/postgres-user-repo';
import { requestContextGeneration } from '../ai/ai-service-client';
import { PostgresTelegramNonceRepository } from '../db/postgres-telegram-nonce-repo';
import { PostgresExternalAccountRepository } from '../db/postgres-external-account-repo';

import { GetNextContextCardsUseCase, ResetContextReadingUseCase, GenerateContextTextUseCase }
    from '../../application/context-reading-service';

import { PostgresContextReadingStateRepository, PostgresContextReadingCardRepository }
    from '../db/postgres-context-reading-repo';

import { TelegramAuthService } from '../../application/telegram-auth-service';
import { ExternalAccountService } from '../../application/external-account-service';

import { registerAuthDecorators } from './routes/auth-decorators';
import { registerCardsRoutes } from './routes/cards-routes';
import { registerAIRoutes } from './routes/ai-routes';
import { registerFoldersRoutes } from './routes/folders-routes';
import { registerContextReadingRoutes } from './routes/context-reading-routes';
import { registerAuthRoutes } from './routes/auth-routes';
import { registerTelegramRoutes } from './routes/telegram-routes';

export async function buildServer() {
    const fastify = Fastify({ logger: true });


    // ✅ Регистрируем cookie для http only
    await fastify.register(cookie);

    // ✅ Регистрируем multipart для загрузки файлов
    await fastify.register(multipart);

    // ✅ JWT setup
    fastify.register(jwt, {
        secret: process.env.JWT_SECRET!,
        cookie: {
            cookieName: 'token', // откуда брать токен
            signed: false,
        },
    });

    // ✅ Регистрируем декораторы аутентификации
    registerAuthDecorators(fastify);

    // ✅ Регистрируем CORS
    await fastify.register(cors, {
        origin: (origin, cb) => {
            // запросы без Origin (curl, прямой запрос) — разрешаем
            if (!origin) {
                return cb(null, true);
            }

            const allowedOrigins = [
                'http://localhost:5173',
                'https://kotcat.com',
            ];

            // разрешаем фронт
            if (allowedOrigins.includes(origin)) {
                return cb(null, true);
            }

            // разрешаем расширения Chrome
            if (origin.startsWith('chrome-extension://')) {
                return cb(null, true);
            }

            // всё остальное — мимо
            return cb(new Error('Not allowed by CORS'), false);
        },
        credentials: true, // ВАЖНО: куки продолжают работать для SPA
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });


    // ✅ Подключаем Swagger
    await fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'Flashcards API',
                description: 'Документация для REST API',
                version: '1.0.0',
            },
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'token', // имя cookie, в которой хранится JWT
                    },
                },
            },
            security: [
                {
                    cookieAuth: [],
                },
            ],
        },
    });

    // ✅ Swagger доступен /docs
    await fastify.register(fastifySwaggerUI, {
        routePrefix: '/docs',
    });

    const cardRepo = new PostgresCardRepository();
    const folderRepo = new PostgresFolderRepository();

    const cardService = new CardService(cardRepo);
    const folderService = new FolderService(folderRepo);

    const userRepo = new PostgresUserRepository();
    const userService = new UserService(userRepo);

    // Репозиторий карточек (ТОЛЬКО для context-reading)
    const contextReadingCardRepo =
        new PostgresContextReadingCardRepository();

    // Репозиторий состояния
    const contextReadingStateRepo =
        new PostgresContextReadingStateRepository();

    // Use-cases
    const getNextContextCardsUseCase =
        new GetNextContextCardsUseCase(
            contextReadingCardRepo,
            contextReadingStateRepo
        );

    const resetContextReadingUseCase =
        new ResetContextReadingUseCase(
            contextReadingStateRepo
        );

    const generateContextTextUseCase =
        new GenerateContextTextUseCase(
            cardRepo,
            userRepo,
            requestContextGeneration
        );

    const telegramNonceRepository = new PostgresTelegramNonceRepository();
    const externalAccountRepo = new PostgresExternalAccountRepository();
    const externalAccountService = new ExternalAccountService(externalAccountRepo);

    const telegramAuthService = new TelegramAuthService(
        telegramNonceRepository,
        externalAccountService
    );

    // ✅ Регистрируем все роуты
    registerCardsRoutes(fastify, cardService, folderRepo);
    registerAIRoutes(fastify, cardService, userService);
    registerFoldersRoutes(fastify, folderService);
    registerContextReadingRoutes(
        fastify,
        getNextContextCardsUseCase,
        resetContextReadingUseCase,
        generateContextTextUseCase
    );
    registerAuthRoutes(fastify, userService, cardService, folderService);
    registerTelegramRoutes(
        fastify,
        telegramAuthService,
        externalAccountService,
        userService,
        folderService,
        getNextContextCardsUseCase,
        resetContextReadingUseCase
    );

    return fastify;
}
