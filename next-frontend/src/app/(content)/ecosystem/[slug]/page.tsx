import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EcosystemDetailClient } from "@app/components/ecosystem-detail-client";
import { getEcosystem, getEcosystems } from "@app/lib/cms/ecosystems";
import { DEFAULT_LOCALE } from "@app/lib/i18n";
import { buildLocalizedHreflangAlternates } from "@app/lib/i18n/hreflang";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await getEcosystems(DEFAULT_LOCALE).catch(() => []);
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEcosystem(DEFAULT_LOCALE, slug).catch(() => null);
  if (!item) return { title: "Not found" };
  return {
    title: item.seoTitle ?? item.title ?? slug,
    description: item.seoDescription ?? undefined,
    alternates: buildLocalizedHreflangAlternates(
      DEFAULT_LOCALE,
      `/ecosystem/${slug}`
    ),
  };
}

export default async function EcosystemDetailPage({ params }: Props) {
  const { slug } = await params;

  const item = await getEcosystem(DEFAULT_LOCALE, slug).catch(() => null);
  if (!item) notFound();

  return (
    <EcosystemDetailClient locale={DEFAULT_LOCALE} slug={slug} item={item} />
  );
}
