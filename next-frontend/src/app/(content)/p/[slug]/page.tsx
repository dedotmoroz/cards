import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageShell } from "@app/components/cms-page-shell";
import { getPage, getPages } from "@app/lib/cms/pages";
import { DEFAULT_LOCALE } from "@app/lib/i18n";
import { buildLocalizedHreflangAlternates } from "@app/lib/i18n/hreflang";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = await getPages(DEFAULT_LOCALE).catch(() => []);
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(DEFAULT_LOCALE, slug).catch(() => null);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    alternates: buildLocalizedHreflangAlternates(DEFAULT_LOCALE, `/p/${slug}`),
  };
}

export default async function StrapiPage({ params }: Props) {
  const { slug } = await params;

  const page = await getPage(DEFAULT_LOCALE, slug).catch(() => null);
  if (!page) notFound();

  return <CmsPageShell page={page} locale={DEFAULT_LOCALE} />;
}
