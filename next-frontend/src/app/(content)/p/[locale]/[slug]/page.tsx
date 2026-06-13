import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageShell } from "@app/components/cms-page-shell";
import { getPage, getPages } from "@app/lib/cms/pages";
import { isSupportedLocale, SITE_BASE_URL } from "@app/lib/i18n";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const locales = ["en", "ru", "uk", "de", "es", "fr", "pl", "pt", "zh"];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const pages = await getPages(locale).catch(() => []);
    for (const page of pages) {
      params.push({ locale, slug: page.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(locale, slug).catch(() => null);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    alternates: { canonical: `${SITE_BASE_URL}/p/${locale}/${slug}` },
  };
}

export default async function StrapiPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const page = await getPage(locale, slug).catch(() => null);
  if (!page) notFound();

  return <CmsPageShell page={page} locale={locale} />;
}
