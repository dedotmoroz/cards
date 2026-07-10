import type { Core } from '@strapi/strapi';

type UrlEntry = {
  loc: string;
  lastmod?: string;
  alternates?: Record<string, string>;
  xDefault?: string;
};
type CacheEntry = { xml: string; expiresAt: number };

const DEFAULT_BASE_URL = 'https://kotcat.com';
const DEFAULT_LOCALES = ['en', 'ru', 'uk', 'de', 'es', 'fr', 'pl', 'pt', 'zh'];
const CACHE_TTL_MS = 10 * 60 * 1000;
const PAGE_SIZE = 500;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(value: unknown): string | undefined {
  const d = value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function buildSitemapXml(urls: UrlEntry[]): string {
  const body = urls
    .map((u) => {
      const loc = `<loc>${escapeXml(u.loc)}</loc>`;
      const lastmod = u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : '';
      const alternates = u.alternates
        ? Object.entries(u.alternates)
          .map(([hreflang, href]) =>
            `<xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`
          )
          .join('')
        : '';
      const xDefault = u.xDefault
        ? `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(u.xDefault)}" />`
        : '';
      return `<url>${loc}${lastmod}${alternates}${xDefault}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
    body +
    `</urlset>`;
}

async function getLocales(strapi: Core.Strapi): Promise<string[]> {
  try {
    const service = strapi.plugin('i18n')?.service('locales');
    const list = (await service?.find()) as Array<{ code?: string }> | undefined;
    const codes = (list ?? []).map((x) => x.code).filter((x): x is string => Boolean(x));
    if (codes.length > 0) return codes;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALES;
}

async function getAllDocs(
  strapi: Core.Strapi,
  uid: string
): Promise<Array<{ documentId?: string; locale?: string; slug: string; updatedAt?: string }>> {
  const out: Array<{ documentId?: string; locale?: string; slug: string; updatedAt?: string }> = [];

  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = (await strapi.db.query(uid).findMany({
      select: ['documentId', 'slug', 'updatedAt', 'publishedAt', 'locale'],
      where: {
        publishedAt: { $notNull: true },
      },
      orderBy: { updatedAt: 'desc' },
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    })) as Array<{ documentId?: string; locale?: string; slug?: string; updatedAt?: string | Date }> | null;

    const items = (rows ?? [])
      .map((r) => ({
        documentId: typeof r.documentId === 'string' ? r.documentId : undefined,
        locale: typeof r.locale === 'string' ? r.locale : undefined,
        slug: typeof r.slug === 'string' ? r.slug : '',
        updatedAt: toIsoDate(r.updatedAt),
      }))
      .filter((x) => x.slug.length > 0);

    out.push(...items);

    if (items.length < PAGE_SIZE) break;
    page += 1;
  }

  return out;
}

function listCollectionsPath(locale: string): string {
  return locale === 'en' ? '/collections' : `/${locale}/collections`;
}

function listEcosystemPath(locale: string): string {
  return locale === 'en' ? '/ecosystem' : `/${locale}/ecosystem`;
}

function detailCollectionsPath(locale: string, slug: string): string {
  return locale === 'en' ? `/collections/${slug}` : `/${locale}/collections/${slug}`;
}

function detailEcosystemPath(locale: string, slug: string): string {
  return locale === 'en' ? `/ecosystem/${slug}` : `/${locale}/ecosystem/${slug}`;
}

function detailPagePath(locale: string, slug: string): string {
  return locale === 'en' ? `/p/${slug}` : `/${locale}/p/${slug}`;
}

function pickXDefault(alternates: Record<string, string>): string | undefined {
  return alternates.en ?? Object.values(alternates)[0];
}

let cache: CacheEntry | null = null;

const middleware: Core.MiddlewareFactory = (_config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.method !== 'GET' || ctx.path !== '/sitemap.xml') {
      return next();
    }

    const now = Date.now();
    if (cache && cache.expiresAt > now) {
      ctx.set('Content-Type', 'application/xml; charset=utf-8');
      ctx.set('Cache-Control', 'public, max-age=600');
      ctx.body = cache.xml;
      return;
    }

    const baseUrl = process.env.SITE_BASE_URL || DEFAULT_BASE_URL;
    const locales = await getLocales(strapi);

    const urls: UrlEntry[] = [];

    // List pages (localized)
    const collectionsListAlternates: Record<string, string> = {};
    const ecosystemListAlternates: Record<string, string> = {};
    for (const locale of locales) {
      collectionsListAlternates[locale] = joinUrl(baseUrl, listCollectionsPath(locale));
      ecosystemListAlternates[locale] = joinUrl(baseUrl, listEcosystemPath(locale));
    }
    const listXDefaultCollections = pickXDefault(collectionsListAlternates);
    const listXDefaultEcosystem = pickXDefault(ecosystemListAlternates);

    for (const locale of locales) {
      urls.push({
        loc: collectionsListAlternates[locale],
        alternates: collectionsListAlternates,
        xDefault: listXDefaultCollections,
      });
      urls.push({
        loc: ecosystemListAlternates[locale],
        alternates: ecosystemListAlternates,
        xDefault: listXDefaultEcosystem,
      });
    }

    // Detail pages from Strapi (group by documentId for hreflang alternates)
    const [pages, collections, ecosystems] = await Promise.all([
      getAllDocs(strapi, 'api::page.page'),
      getAllDocs(strapi, 'api::collection.collection'),
      getAllDocs(strapi, 'api::ecosystem.ecosystem'),
    ]);

    const uids: Array<{
      items: Array<{ documentId?: string; locale?: string; slug: string; updatedAt?: string }>;
      pathFor: (locale: string, slug: string) => string;
    }> = [
      { items: pages, pathFor: detailPagePath },
      { items: collections, pathFor: detailCollectionsPath },
      { items: ecosystems, pathFor: detailEcosystemPath },
    ];

    for (const { items, pathFor } of uids) {
      const groups = new Map<string, Array<{ locale: string; slug: string; updatedAt?: string }>>();

      for (const it of items) {
        if (!it.documentId || !it.locale) continue;
        if (!locales.includes(it.locale)) continue;
        const arr = groups.get(it.documentId) ?? [];
        arr.push({ locale: it.locale, slug: it.slug, updatedAt: it.updatedAt });
        groups.set(it.documentId, arr);
      }

      for (const group of groups.values()) {
        const alternates: Record<string, string> = {};
        for (const v of group) {
          alternates[v.locale] = joinUrl(baseUrl, pathFor(v.locale, v.slug));
        }
        const xDefault = pickXDefault(alternates);

        for (const v of group) {
          urls.push({
            loc: alternates[v.locale],
            lastmod: v.updatedAt,
            alternates,
            xDefault,
          });
        }
      }
    }

    // De-dupe URLs (keep first lastmod)
    const seen = new Set<string>();
    const deduped: UrlEntry[] = [];
    for (const u of urls) {
      if (seen.has(u.loc)) continue;
      seen.add(u.loc);
      deduped.push(u);
    }

    const xml = buildSitemapXml(deduped);
    cache = { xml, expiresAt: now + CACHE_TTL_MS };

    ctx.set('Content-Type', 'application/xml; charset=utf-8');
    ctx.set('Cache-Control', 'public, max-age=600');
    ctx.body = xml;
  };
};

export default middleware;

