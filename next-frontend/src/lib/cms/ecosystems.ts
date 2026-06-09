import { cmsAssetUrl, strapiFetch } from "./strapi-server";

export type EcosystemListItem = {
  id: number;
  title?: string | null;
  slug: string;
  prevText?: unknown;
  prevImg?: { url?: string; data?: { attributes?: { url?: string } } } | null;
};

export type EcosystemItem = EcosystemListItem & {
  content?: string | null;
  contentBlock?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: unknown;
};

type StrapiList<T> = { data: T[] };

export async function getEcosystems(locale: string): Promise<EcosystemListItem[]> {
  const params = new URLSearchParams({
    locale,
    "fields[0]": "title",
    "fields[1]": "slug",
    "fields[2]": "prevText",
    "pagination[pageSize]": "100",
  });
  const data = await strapiFetch<StrapiList<EcosystemListItem>>(
    `/api/ecosystems?${params}&populate=prevImg`
  );
  return data.data ?? [];
}

export async function getEcosystem(
  locale: string,
  slug: string
): Promise<EcosystemItem | null> {
  const params = new URLSearchParams({
    "filters[slug][$eq]": slug,
    locale,
  });
  const data = await strapiFetch<StrapiList<EcosystemItem>>(
    `/api/ecosystems?${params}&populate[0]=images`
  );
  return data.data?.[0] ?? null;
}

export function getEcosystemPreviewUrl(item: EcosystemListItem): string {
  const url = item.prevImg?.data?.attributes?.url ?? item.prevImg?.url ?? "";
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return cmsAssetUrl(url);
}

export type EcosystemImage = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};

export function parseEcosystemImages(images: EcosystemItem["images"]): EcosystemImage[] {
  if (Array.isArray(images)) {
    return images
      .map((x) => x as { url?: string; width?: number; height?: number; alternativeText?: string } | null)
      .filter(Boolean)
      .map((x) => ({
        src: x!.url ? cmsAssetUrl(x!.url) : "",
        width: x!.width,
        height: x!.height,
        alt: x!.alternativeText ?? "",
      }))
      .filter((x) => x.src);
  }

  const dataList =
    (images as { data?: Array<{ attributes?: { url?: string; width?: number; height?: number; alternativeText?: string } }> } | null)?.data ?? [];

  return dataList
    .map((x) => x.attributes)
    .filter(Boolean)
    .map((a) => ({
      src: a!.url ? cmsAssetUrl(a!.url) : "",
      width: a!.width,
      height: a!.height,
      alt: a!.alternativeText ?? "",
    }))
    .filter((x) => x.src);
}
