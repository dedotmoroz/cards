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

/** Browser-facing CMS asset URL (via /cms rewrite or public base). */
export function cmsAssetUrl(path: string | undefined | null): string {
  if (!path) return "";

  let assetPath = path;
  if (/^https?:\/\//i.test(path)) {
    try {
      const u = new URL(path);
      let serverHost = "";
      try {
        serverHost = new URL(getStrapiServerUrl()).host;
      } catch {
        /* ignore */
      }
      const isInternal =
        u.hostname === "localhost" ||
        u.hostname === "127.0.0.1" ||
        u.hostname === "strapi" ||
        (serverHost !== "" && u.host === serverHost);
      if (!isInternal) return path;
      assetPath = `${u.pathname}${u.search}`;
    } catch {
      return path;
    }
  }

  if (assetPath.startsWith("/cms")) return assetPath;

  const publicBase = process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL?.replace(
    /\/$/,
    ""
  );
  if (publicBase) {
    return `${publicBase}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
  }

  return `/cms${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}
