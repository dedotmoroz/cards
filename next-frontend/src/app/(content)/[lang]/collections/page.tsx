import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionsListShell } from "@app/components/collections-list-shell";
import { getCollections } from "@app/lib/cms/collections";
import { isSupportedLocale } from "@app/lib/i18n";
import { buildLocalizedHreflangAlternates } from "@app/lib/i18n/hreflang";

export const revalidate = 60;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return {
    title: "Vocabulary Collections",
    alternates: buildLocalizedHreflangAlternates(lang, "/collections"),
  };
}

export default async function LocalizedCollectionsPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const collections = await getCollections(lang).catch(() => []);

  return (
    <CollectionsListShell locale={lang} collections={collections} />
  );
}
