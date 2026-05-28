import { Buffer } from 'node:buffer';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { GoogleSheetsService } from '../../../application/google-sheets-service';
import { GOOGLE_SHEETS_OAUTH_SCOPES } from '../../../application/google-sheets-oauth-scopes';
import type { GoogleSheetsTokensRepository } from '../../../ports/google-sheets-tokens-repository';
import {
    googlePickerAccessTokenFromRequest,
} from '../google-picker-access-token';

/** Разрешены только относительные пути вида /learn/... */
function validateLearnPath(path: string): string | null {
    if (!path || typeof path !== 'string') return null;
    const p = path.trim();
    if (!p.startsWith('/')) return null;
    if (p.includes('..')) return null;
    if (p.includes('//')) return null;
    if (p.length > 1024) return null;
    if (!p.startsWith('/learn/')) return null;
    return p;
}

function sanitizeReturnPathFromQuery(raw: string | undefined): string | null {
    if (raw === undefined || raw === '') return null;
    const t = raw.trim();
    let p = validateLearnPath(t);
    if (p) return p;
    try {
        return validateLearnPath(decodeURIComponent(t));
    } catch {
        return null;
    }
}

function encodeOAuthState(userId: string, returnPath: string | null): string {
    return Buffer.from(JSON.stringify({ u: userId, r: returnPath }), 'utf8').toString('base64url');
}

function decodeOAuthState(state: string): { userId: string; returnPath: string | null } {
    if (!state) return { userId: '', returnPath: null };
    try {
        const json = Buffer.from(state, 'base64url').toString('utf8');
        const o = JSON.parse(json) as { u?: string; r?: string | null };
        if (o && typeof o.u === 'string') {
            const rp =
                typeof o.r === 'string' && o.r.length > 0 ? validateLearnPath(o.r) : null;
            return { userId: o.u, returnPath: rp };
        }
    } catch {
        // ранее state был просто userId (uuid)
    }
    return { userId: state, returnPath: null };
}

function buildFrontendSuccessUrl(frontendBase: string, returnPath: string | null): string {
    const base = frontendBase.replace(/\/$/, '');
    const path = returnPath && returnPath !== '/' ? returnPath : '/';
    const url = new URL(path, `${base}/`);
    url.searchParams.set('google_sheets', 'connected');
    return url.toString();
}

export function registerGoogleSheetsRoutes(
    fastify: FastifyInstance,
    googleSheetsService: GoogleSheetsService,
    tokensRepo: GoogleSheetsTokensRepository,
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
    fastify.get(
        '/auth/google/sheets',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        return_to: { type: 'string' },
                    },
                },
                tags: ['auth'],
                summary: 'Redirect to Google OAuth for Sheets',
            },
        },
        async (
            req: FastifyRequest<{ Querystring: { return_to?: string } }>,
            reply: FastifyReply,
        ) => {
            const userId = (req.user as any).userId;
            const returnPath = sanitizeReturnPathFromQuery(req.query.return_to);
            const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
            const url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: [...GOOGLE_SHEETS_OAUTH_SCOPES],
                prompt: 'consent',
                state: encodeOAuthState(userId, returnPath),
            });
            return reply.redirect(url, 302);
        },
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
            const { code, state: stateParam, error: oauthError } = req.query;
            const { userId, returnPath } = decodeOAuthState(stateParam ?? '');

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

                return reply.redirect(buildFrontendSuccessUrl(frontendUrl, returnPath), 302);
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
            const connected = await googleSheetsService.isConnected(userId);
            return reply.send({ connected });
        }
    );

    /**
     * Отключить Google Sheets — удалить сохранённые токены
     */
    fastify.delete(
        '/auth/google/sheets',
        {
            preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            disconnected: { type: 'boolean' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Disconnect Google Sheets',
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const userId = (req.user as any).userId;
            await tokensRepo.deleteByUserId(userId);
            return reply.send({ disconnected: true });
        },
    );

    /**
     * Access token for Google Picker from saved OAuth connection.
     */
    fastify.get(
        '/auth/google/sheets/picker-token',
        {
            preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            accessToken: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Get Google Sheets access token for Picker',
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const userId = (req.user as any).userId;
            try {
                const accessToken = await googleSheetsService.getValidAccessToken(userId);
                return reply.send({ accessToken });
            } catch (err) {
                req.log.warn({ err, userId }, 'Google Sheets: picker token unavailable');
                return reply.code(401).send({
                    message: err instanceof Error ? err.message : 'Google Sheets not connected',
                });
            }
        },
    );

    /**
     * Названия листов внутри таблицы — для выбора листа при импорте
     */
    fastify.get(
        '/auth/google/sheets/spreadsheet/:spreadsheetId/sheet-titles',
        {
            preHandler: [fastify.authenticate],
            schema: {
                params: {
                    type: 'object',
                    required: ['spreadsheetId'],
                    properties: {
                        spreadsheetId: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$' },
                    },
                },
                tags: ['auth'],
                summary: 'List sheet tab titles in a spreadsheet',
            },
        },
        async (
            req: FastifyRequest<{ Params: { spreadsheetId: string } }>,
            reply: FastifyReply,
        ) => {
            const userId = (req.user as any).userId;
            const { spreadsheetId } = req.params;
            const googlePickerAccessToken = googlePickerAccessTokenFromRequest(req);
            try {
                const titles = await googleSheetsService.getSpreadsheetSheetTitles(
                    userId,
                    spreadsheetId,
                    googlePickerAccessToken ? { googlePickerAccessToken } : undefined,
                );
                return reply.send({ titles });
            } catch (err) {
                req.log.error({ err, spreadsheetId }, 'Google Sheets: getSpreadsheetSheetTitles failed');
                return reply.code(502).send({
                    message: err instanceof Error ? err.message : 'Failed to load sheet titles',
                });
            }
        },
    );
}
