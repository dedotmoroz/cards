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
import { requestContextGeneration, fetchContextGenerationStatus, promoteContextAudio, deleteContextArtifactAudio } from '../ai/ai-service-client';
import { PostgresTelegramNonceRepository } from '../db/postgres-telegram-nonce-repo';
import { PostgresExternalAccountRepository } from '../db/postgres-external-account-repo';

import {
    GetNextContextCardsUseCase,
    ResetContextReadingUseCase,
    GenerateContextTextUseCase,
    GetContextReadingArtifactHistoryUseCase,
    PersistContextReadingArtifactUseCase,
} from '../../application/context-reading-service';

import { PostgresContextReadingStateRepository, PostgresContextReadingCardRepository }
    from '../db/postgres-context-reading-repo';
import { PostgresContextReadingArtifactRepository }
    from '../db/postgres-context-reading-artifact-repo';

import { TelegramAuthService } from '../../application/telegram-auth-service';
import { ExternalAccountService } from '../../application/external-account-service';

import { registerAuthDecorators } from './routes/auth-decorators';
import { registerCardsRoutes } from './routes/cards-routes';
import { registerAIRoutes } from './routes/ai-routes';
import { registerFoldersRoutes } from './routes/folders-routes';
import { registerContextReadingRoutes } from './routes/context-reading-routes';
import { registerAuthRoutes } from './routes/auth-routes';
import { registerTelegramRoutes } from './routes/telegram-routes';
import { registerTranslateRoutes } from './routes/translate-routes';
import { registerPublishRoutes } from './routes/publish-routes';
import { registerGoogleSheetsRoutes } from './routes/google-sheets-routes';
import { GOOGLE_PICKER_ACCESS_TOKEN_HEADER } from './google-picker-access-token';
import { registerAdminRoutes } from './routes/admin-routes';
import { GoogleSheetsService } from '../../application/google-sheets-service';
import { PostgresGoogleSheetsTokensRepository } from '../db/postgres-google-sheets-tokens-repo';
import { PostgresAdminRepository } from '../db/postgres-admin-repo';
import { AdminService } from '../../application/admin-service';

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

    // ✅ Репозиторий админов нужен раньше всего, чтобы повесить декоратор requireAdmin
    const adminRepo = new PostgresAdminRepository();

    // ✅ Регистрируем декораторы аутентификации
    registerAuthDecorators(fastify, adminRepo);

    // ✅ Регистрируем CORS
    await fastify.register(cors, {
        origin: (origin, cb) => {
            // запросы без Origin (curl, прямой запрос) — разрешаем
            if (!origin) {
                return cb(null, true);
            }

            const allowedOrigins = [
                'http://localhost:8888',
                'http://localhost:7777',
                'https://kotcat.com',
            ];

            // разрешаем фронт
            if (allowedOrigins.includes(origin)) {
                return cb(null, true);
            }

            // dev: localhost / LAN IP on any port (e.g. http://192.168.1.50:7777)
            if (
                process.env.NODE_ENV !== 'production' &&
                /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
                    origin
                )
            ) {
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
        allowedHeaders: ['Content-Type', 'Authorization', GOOGLE_PICKER_ACCESS_TOKEN_HEADER],
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

    // Репозиторий карточек (ТОЛЬКО для context-reading)
    const contextReadingCardRepo =
        new PostgresContextReadingCardRepository();

    // Репозиторий состояния
    const contextReadingStateRepo =
        new PostgresContextReadingStateRepository();

    const contextReadingArtifactRepo =
        new PostgresContextReadingArtifactRepository();

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
            folderRepo,
            requestContextGeneration
        );

    const getContextReadingArtifactHistoryUseCase =
        new GetContextReadingArtifactHistoryUseCase(
            contextReadingArtifactRepo,
            folderRepo
        );

    const persistContextReadingArtifactUseCase =
        new PersistContextReadingArtifactUseCase(
            contextReadingArtifactRepo,
            cardRepo,
            folderRepo,
            fetchContextGenerationStatus,
            promoteContextAudio,
            deleteContextArtifactAudio
        );

    const telegramNonceRepository = new PostgresTelegramNonceRepository();
    const externalAccountRepo = new PostgresExternalAccountRepository();
    const externalAccountService = new ExternalAccountService(externalAccountRepo);

    const telegramAuthService = new TelegramAuthService(
        telegramNonceRepository,
        externalAccountService
    );

    const googleSheetsTokensRepo = new PostgresGoogleSheetsTokensRepository();
    const userService = new UserService(
        userRepo,
        folderRepo,
        cardRepo,
        contextReadingStateRepo,
        googleSheetsTokensRepo,
        externalAccountRepo,
        contextReadingArtifactRepo
    );
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleSheetsService =
        googleClientId && googleClientSecret
            ? new GoogleSheetsService(googleSheetsTokensRepo, googleClientId, googleClientSecret)
            : undefined;

    // ✅ Регистрируем все роуты
    registerCardsRoutes(fastify, cardService, folderRepo, cardRepo, googleSheetsService);
    registerAIRoutes(fastify, cardService, userService, folderRepo);
    registerFoldersRoutes(fastify, folderService, cardRepo);
    registerContextReadingRoutes(
        fastify,
        getNextContextCardsUseCase,
        resetContextReadingUseCase,
        generateContextTextUseCase,
        getContextReadingArtifactHistoryUseCase,
        persistContextReadingArtifactUseCase
    );
    const adminService = new AdminService(adminRepo, userService);

    registerAuthRoutes(fastify, userService, cardService, folderService, adminRepo);
    registerAdminRoutes(fastify, adminService);
    registerTelegramRoutes(
        fastify,
        telegramAuthService,
        externalAccountService,
        userService,
        folderService,
        getNextContextCardsUseCase,
        resetContextReadingUseCase
    );
    registerTranslateRoutes(fastify);

    if (process.env.STRAPI_API_TOKEN) {
        registerPublishRoutes(fastify);
    } else {
        fastify.log.warn('Publish to Strapi not configured: STRAPI_API_TOKEN missing');
    }

    if (googleSheetsService) {
        registerGoogleSheetsRoutes(fastify, googleSheetsService, googleSheetsTokensRepo);
    }

    return fastify;
}
