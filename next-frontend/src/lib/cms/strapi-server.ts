/** Server-only Strapi base URL (not rewritten; direct to CMS). */
export function getStrapiServerUrl(): string {
  return (
    process.env.STRAPI_SERVER_URL ??
    process.env.STRAPI_URL ??
    "http://localhost:1337"
  );
}

export async function strapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getStrapiServerUrl().replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    next: init?.next ?? { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export function cmsAssetUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = getStrapiServerUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
