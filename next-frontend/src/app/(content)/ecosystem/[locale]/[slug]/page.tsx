import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EcosystemDetailClient } from "@app/components/ecosystem-detail-client";
import { getEcosystem, getEcosystems } from "@app/lib/cms/ecosystems";
import { isSupportedLocale, SITE_BASE_URL } from "@app/lib/i18n";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const locales = ["en", "ru", "uk", "de", "es", "fr", "pl", "pt", "zh"];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const items = await getEcosystems(locale).catch(() => []);
    for (const item of items) {
      params.push({ locale, slug: item.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getEcosystem(locale, slug).catch(() => null);
  if (!item) return { title: "Not found" };
  return {
    title: item.seoTitle ?? item.title ?? slug,
    description: item.seoDescription ?? undefined,
    alternates: { canonical: `${SITE_BASE_URL}/ecosystem/${locale}/${slug}` },
  };
}

export default async function EcosystemDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const item = await getEcosystem(locale, slug).catch(() => null);
  if (!item) notFound();

  return <EcosystemDetailClient locale={locale} />;
}
