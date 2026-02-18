const STRAPI_URL = import.meta.env.PROD ? "http://kotcat.com:1337" : "http://localhost:1337";

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

console.log('STRAPI_URL', STRAPI_URL);

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