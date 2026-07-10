import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageShell } from "@app/components/cms-page-shell";
import { getPage, getPages } from "@app/lib/cms/pages";
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
    const pages = await getPages(lang).catch(() => []);
    for (const page of pages) {
      params.push({ lang, slug: page.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang) || lang === DEFAULT_LOCALE) return {};
  const page = await getPage(lang, slug).catch(() => null);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    alternates: buildLocalizedHreflangAlternates(lang, `/p/${slug}`),
  };
}

export default async function LocalizedStrapiPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang) || lang === DEFAULT_LOCALE) notFound();

  const page = await getPage(lang, slug).catch(() => null);
  if (!page) notFound();

  return <CmsPageShell page={page} locale={lang} />;
}
