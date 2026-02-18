const STRAPI_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:1337`;

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