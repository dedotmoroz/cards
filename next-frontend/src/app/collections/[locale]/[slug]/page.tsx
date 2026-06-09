import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionDetailClient } from "@app/components/collection-detail-client";
import { getCollection, getCollections } from "@app/lib/cms/collections";
import { isSupportedLocale } from "@app/lib/i18n";
import { SITE_BASE_URL } from "@app/lib/i18n";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const locales = ["en", "ru", "uk", "de", "es", "fr", "pl", "pt", "zh"];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const items = await getCollections(locale).catch(() => []);
    for (const item of items) {
      params.push({ locale, slug: item.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await getCollection(locale, slug).catch(() => null);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.seoTitle ?? collection.title,
    description: collection.seoDescription ?? undefined,
    alternates: {
      canonical: `${SITE_BASE_URL}/collections/${locale}/${slug}`,
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const collection = await getCollection(locale, slug).catch(() => null);
  if (!collection) notFound();

  return <CollectionDetailClient locale={locale} />;
}
