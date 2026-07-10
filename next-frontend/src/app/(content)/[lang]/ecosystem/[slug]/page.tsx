import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EcosystemDetailClient } from "@app/components/ecosystem-detail-client";
import { getEcosystem, getEcosystems } from "@app/lib/cms/ecosystems";
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
    const items = await getEcosystems(lang).catch(() => []);
    for (const item of items) {
      params.push({ lang, slug: item.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang) || lang === DEFAULT_LOCALE) return {};
  const item = await getEcosystem(lang, slug).catch(() => null);
  if (!item) return { title: "Not found" };
  return {
    title: item.seoTitle ?? item.title ?? slug,
    description: item.seoDescription ?? undefined,
    alternates: buildLocalizedHreflangAlternates(lang, `/ecosystem/${slug}`),
  };
}

export default async function LocalizedEcosystemDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang) || lang === DEFAULT_LOCALE) notFound();

  const item = await getEcosystem(lang, slug).catch(() => null);
  if (!item) notFound();

  return <EcosystemDetailClient locale={lang} slug={slug} item={item} />;
}
