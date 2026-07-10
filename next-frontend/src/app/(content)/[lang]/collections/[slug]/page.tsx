import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionDetailClient } from "@app/components/collection-detail-client";
import { getCollection, getCollections } from "@app/lib/cms/collections";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@app/lib/i18n";
import { buildLocalizedHreflangAlternates } from "@app/lib/i18n/hreflang";

export const revalidate = 60;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of SUPPORTED_LOCALES) {
    if (lang === DEFAULT_LOCALE) continue;
    const items = await getCollections(lang).catch(() => []);
    for (const item of items) {
      params.push({ lang, slug: item.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang) || lang === DEFAULT_LOCALE) return {};
  const collection = await getCollection(lang, slug).catch(() => null);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.seoTitle ?? collection.title,
    description: collection.seoDescription ?? undefined,
    alternates: buildLocalizedHreflangAlternates(lang, `/collections/${slug}`),
  };
}

export default async function LocalizedCollectionPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang) || lang === DEFAULT_LOCALE) notFound();

  const collection = await getCollection(lang, slug).catch(() => null);
  if (!collection) notFound();

  return (
    <CollectionDetailClient
      locale={lang}
      slug={slug}
      collection={collection}
    />
  );
}
