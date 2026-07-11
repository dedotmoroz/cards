import { cmsAssetUrl, strapiFetch } from "./strapi-server";

export type CollectionListItem = {
  id: number;
  title: string;
  slug: string;
  cover?: { url?: string; data?: { attributes?: { url?: string } } } | null;
};

export type CollectionItem = CollectionListItem & {
  content?: unknown;
  words?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

type StrapiList<T> = { data: T[] };

export async function getCollections(
  locale: string
): Promise<CollectionListItem[]> {
  const params = new URLSearchParams({
    locale,
    "fields[0]": "title",
    "fields[1]": "slug",
    "pagination[pageSize]": "100",
  });
  const data = await strapiFetch<StrapiList<CollectionListItem>>(
    `/api/collections?${params}&populate=cover`
  );
  return data.data ?? [];
}

export async function getCollection(
  locale: string,
  slug: string
): Promise<CollectionItem | null> {
  const params = new URLSearchParams({
    "filters[slug][$eq]": slug,
    locale,
  });
  const data = await strapiFetch<StrapiList<CollectionItem>>(
    `/api/collections?${params}`
  );
  return data.data?.[0] ?? null;
}

export function getCollectionCoverUrl(item: CollectionListItem): string {
  const url =
    item.cover?.data?.attributes?.url ?? item.cover?.url ?? "";
  return cmsAssetUrl(url);
}
