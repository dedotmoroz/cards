import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionDetailClient } from "@app/components/collection-detail-client";
import { getCollection, getCollections } from "@app/lib/cms/collections";
import { DEFAULT_LOCALE } from "@app/lib/i18n";
import { buildLocalizedHreflangAlternates } from "@app/lib/i18n/hreflang";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await getCollections(DEFAULT_LOCALE).catch(() => []);
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(DEFAULT_LOCALE, slug).catch(() => null);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.seoTitle ?? collection.title,
    description: collection.seoDescription ?? undefined,
    alternates: buildLocalizedHreflangAlternates(
      DEFAULT_LOCALE,
      `/collections/${slug}`
    ),
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;

  const collection = await getCollection(DEFAULT_LOCALE, slug).catch(() => null);
  if (!collection) notFound();

  return (
    <CollectionDetailClient
      locale={DEFAULT_LOCALE}
      slug={slug}
      collection={collection}
    />
  );
}
