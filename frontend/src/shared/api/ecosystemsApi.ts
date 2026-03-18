import { STRAPI_URL } from './strapiBase';

export interface EcosystemListItem {
    id: number;
    title?: string | null;
    slug: string;
    prevText?: unknown;
    prevImg?: { url?: string; data?: { attributes?: { url?: string } } } | null;
}

export interface EcosystemItem extends EcosystemListItem {
    content?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    images?: { url?: string; data?: Array<{ attributes?: { url?: string } }> } | null;
}

export async function getEcosystems(locale: string): Promise<EcosystemListItem[]> {
    const params = new URLSearchParams({
        locale: locale,
        'fields[0]': 'title',
        'fields[1]': 'slug',
        'fields[2]': 'prevText',
        'pagination[pageSize]': '100',
    });
    const res = await fetch(`${STRAPI_URL}/api/ecosystems?${params}&populate=prevImg`);
    if (!res.ok) {
        throw new Error('Failed to fetch ecosystems');
    }
    const data = await res.json();
    return data.data ?? [];
}

export async function getEcosystem(locale: string, slug: string): Promise<EcosystemItem | null> {
    const params = new URLSearchParams({
        'filters[slug][$eq]': slug,
        locale: locale,
    });
    const res = await fetch(`${STRAPI_URL}/api/ecosystems?${params}&populate=prevImg&populate=images`);
    if (!res.ok) {
        throw new Error('Failed to fetch ecosystem');
    }
    const data = await res.json();
    return data.data?.[0] ?? null;
}
