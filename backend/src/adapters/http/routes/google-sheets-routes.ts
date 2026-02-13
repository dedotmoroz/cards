import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { GoogleSheetsService } from '../../../application/google-sheets-service';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export function registerGoogleSheetsRoutes(
    fastify: FastifyInstance,
    googleSheetsService: GoogleSheetsService,
    tokensRepo: { save: (row: { userId: string; accessToken: string; refreshToken: string | null; expiresAt: Date }) => Promise<void> }
) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/sheets/callback';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8888';

    if (!clientId || !clientSecret) {
        fastify.log.warn('Google Sheets OAuth not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing');
        return;
    }

    /**
     * Начать OAuth для Google Sheets — редирект на Google
     */
    fastify.get('/auth/google/sheets',
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ['auth'],
                summary: 'Redirect to Google OAuth for Sheets',
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const userId = (req.user as any).userId;
            const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
            const url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
                prompt: 'consent',
                state: userId,
            });
            return reply.redirect(url, 302);
        }
    );

    /**
     * Callback от Google — обмен code на токены, сохранение, редирект на фронт
     */
    fastify.get('/auth/google/sheets/callback',
        {
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                        state: { type: 'string' },
                        error: { type: 'string' },
                    },
                },
                tags: ['auth'],
                summary: 'Google OAuth callback for Sheets',
            },
        },
        async (req: FastifyRequest<{ Querystring: { code?: string; state?: string; error?: string } }>, reply: FastifyReply) => {
            const { code, state: userId, error: oauthError } = req.query;

            if (oauthError) {
                return reply.redirect(`${frontendUrl}/?google_sheets_error=denied`, 302);
            }

            if (!code || !userId) {
                return reply.redirect(`${frontendUrl}/?google_sheets_error=missing_code`, 302);
            }

            try {
                const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
                const { tokens } = await oauth2Client.getToken(code);
                if (!tokens.access_token || !tokens.expiry_date) {
                    req.log.warn({ hasAccessToken: !!tokens.access_token }, 'Google Sheets: no tokens in response');
                    return reply.redirect(`${frontendUrl}/?google_sheets_error=no_tokens`, 302);
                }

                req.log.info({ userId, redirectUri }, 'Google Sheets: saving tokens for user');
                await tokensRepo.save({
                    userId,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || null,
                    expiresAt: new Date(tokens.expiry_date),
                });
                req.log.info({ userId }, 'Google Sheets: tokens saved successfully');

                return reply.redirect(`${frontendUrl}/?google_sheets=connected`, 302);
            } catch (err) {
                req.log.error({ err, userId }, 'Google Sheets OAuth callback error');
                return reply.redirect(`${frontendUrl}/?google_sheets_error=exchange_failed`, 302);
            }
        }
    );

    /**
     * Проверка: подключены ли Google Sheets у пользователя
     */
    fastify.get('/auth/google/sheets/status',
        {
            preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            connected: { type: 'boolean' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Check if Google Sheets is connected',
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const userId = (req.user as any).userId;
            const connected = await googleSheetsService.hasTokens(userId);
            return reply.send({ connected });
        }
    );
}
