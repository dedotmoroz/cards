import slugify from 'slugify';
import { URL } from 'node:url';

const DEFAULT_STRAPI_CMS_URL = 'https://cms.kotcat.com';
// const DEFAULT_STRAPI_CMS_URL = 'http://localhost:1337';

export type PublishPageInput = {
    title: string;
    content: string;
    locale?: string;
};

export type PublishCollectionInput = {
    title: string;
    slug: string;
    /** JSON field in Strapi; e.g. string[] or structured objects */
    words: unknown;
    locale?: string;
};

export type StrapiCreateResult = {
    id: string | number;
    slug: string;
};

export class StrapiRequestError extends Error {
    constructor(
        readonly status: number,
        readonly responseBody: string,
    ) {
        super(`Strapi request failed with status ${status}`);
        this.name = 'StrapiRequestError';
    }
}

export function buildPagePayload(input: PublishPageInput, timestampMs: number = Date.now()) {
    const slug = `${slugify(input.title, { lower: true, strict: true })}-${timestampMs}`;
    return {
        data: {
            title: input.title,
            slug,
            locale: input.locale ?? 'en',
            publishedAt: new Date().toISOString(),
            content: [
                {
                    type: 'paragraph',
                    children: [{ type: 'text', text: input.content }],
                },
            ],
        },
    };
}

export function buildCollectionPayload(input: PublishCollectionInput) {
    return {
        data: {
            title: input.title,
            slug: input.slug,
            words: input.words,
            locale: input.locale ?? 'en',
            publishedAt: new Date().toISOString(),
        },
    };
}

function parseCreateResponse(json: unknown, fallbackSlug: string): StrapiCreateResult {
    if (!json || typeof json !== 'object' || !('data' in json)) {
        return { id: '', slug: fallbackSlug };
    }
    const data = (json as { data: unknown }).data;
    if (!data || typeof data !== 'object') {
        return { id: '', slug: fallbackSlug };
    }
    const record = data as Record<string, unknown>;
    const rawId = record.id ?? record.documentId;
    const id =
        typeof rawId === 'string' || typeof rawId === 'number' ? rawId : '';
    let slug = fallbackSlug;
    const attrs = record.attributes;
    if (attrs && typeof attrs === 'object' && 'slug' in attrs && typeof (attrs as { slug: unknown }).slug === 'string') {
        slug = (attrs as { slug: string }).slug;
    }
    return { id, slug };
}

async function postStrapi(apiPath: string, payload: { data: Record<string, unknown> }): Promise<StrapiCreateResult> {
    const token = process.env.STRAPI_API_TOKEN;
    if (!token) {
        throw new Error('STRAPI_API_TOKEN is not configured');
    }

    const base = process.env.STRAPI_CMS_URL ?? DEFAULT_STRAPI_CMS_URL;
    const url = new URL(apiPath.startsWith('/') ? apiPath : `/${apiPath}`, base.endsWith('/') ? base : `${base}/`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const text = await response.text();

    if (!response.ok) {
        throw new StrapiRequestError(response.status, text);
    }

    let json: unknown;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        throw new Error(`Strapi returned invalid JSON: ${text.slice(0, 200)}`);
    }

    const fallbackSlug =
        typeof payload.data.slug === 'string' ? payload.data.slug : '';
    return parseCreateResponse(json, fallbackSlug);
}

export async function publishPage(input: PublishPageInput): Promise<StrapiCreateResult> {
    const payload = buildPagePayload(input);
    return postStrapi('/api/pages', payload);
}

export async function publishCollection(input: PublishCollectionInput): Promise<StrapiCreateResult> {
    const payload = buildCollectionPayload(input);
    return postStrapi('/api/collections', payload);
}
