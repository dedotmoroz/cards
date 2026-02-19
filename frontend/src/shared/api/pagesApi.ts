const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
const STRAPI_URL = isLocalhost ? 'http://localhost:1337' : '/cms';

export async function getPage(locale: string, slug: string) {
    const res = await fetch(
        `${STRAPI_URL}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch page");
    }

    const data = await res.json();
    return data.data?.[0] ?? null;
}

export async function getPages(locale: string) {
    const res = await fetch(
        `${STRAPI_URL}/api/pages?locale=${encodeURIComponent(locale)}&pagination[pageSize]=100`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch pages");
    }

    const data = await res.json();
    return data.data ?? [];
}