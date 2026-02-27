import { STRAPI_URL } from './strapiBase';

export interface CollectionListItem {
    id: number;
    title: string;
    slug: string;
    cover?: { url?: string; data?: { attributes?: { url?: string } } } | null;
}

export interface CollectionItem extends CollectionListItem {
    content?: unknown;
    seoTitle?: string | null;
    seoDescription?: string | null;
}

export async function getCollections(locale: string): Promise<CollectionListItem[]> {
    const params = new URLSearchParams({
        locale: locale,
        'fields[0]': 'title',
        'fields[1]': 'slug',
        'pagination[pageSize]': '100',
    });
    const res = await fetch(
        `${STRAPI_URL}/api/collections?${params}&populate=cover`
    );
    if (!res.ok) {
        throw new Error('Failed to fetch collections');
    }
    const data = await res.json();
    return data.data ?? [];
}

export async function getCollection(locale: string, slug: string): Promise<CollectionItem | null> {
    const params = new URLSearchParams({
        'filters[slug][$eq]': slug,
        locale: locale,
    });
    const res = await fetch(`${STRAPI_URL}/api/collections?${params}`);
    if (!res.ok) {
        throw new Error('Failed to fetch collection');
    }
    const data = await res.json();
    return data.data?.[0] ?? null;
}
