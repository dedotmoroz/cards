import type { FastifyRequest } from 'fastify';

/** Single header for GIS access token after Picker (must match frontend). */
export const GOOGLE_PICKER_ACCESS_TOKEN_HEADER = 'x-google-picker-access-token';

export const GOOGLE_PICKER_ACCESS_TOKEN_REQUIRED_MESSAGE =
    'Select a spreadsheet via Google Picker first (missing access token).';

export function googlePickerAccessTokenFromRequest(
    req: FastifyRequest,
    bodyToken?: string | undefined,
): string | undefined {
    const h = req.headers[GOOGLE_PICKER_ACCESS_TOKEN_HEADER];
    const fromHeader =
        typeof h === 'string' ? h.trim() : Array.isArray(h) ? (h[0] ?? '').trim() : '';
    const fromBody = bodyToken?.trim() ?? '';
    const combined = fromHeader || fromBody;
    return combined.length > 0 ? combined : undefined;
}
