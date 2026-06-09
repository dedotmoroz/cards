import { strapiFetch } from "./strapi-server";

export type CmsPage = {
  id: number;
  title: string;
  slug: string;
  content?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

type StrapiList<T> = { data: T[] };

export async function getPages(locale: string): Promise<CmsPage[]> {
  const q = new URLSearchParams({
    locale,
    "pagination[pageSize]": "100",
  });
  const data = await strapiFetch<StrapiList<CmsPage>>(`/api/pages?${q}`);
  return data.data ?? [];
}

export async function getPage(
  locale: string,
  slug: string
): Promise<CmsPage | null> {
  const q = new URLSearchParams({
    "filters[slug][$eq]": slug,
    locale,
  });
  const data = await strapiFetch<StrapiList<CmsPage>>(`/api/pages?${q}`);
  return data.data?.[0] ?? null;
}
