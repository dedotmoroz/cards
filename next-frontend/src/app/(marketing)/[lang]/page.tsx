import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupportedLocale } from "@app/lib/i18n";
import { getLandingDictionary, getLocaleFromParams } from "@app/lib/i18n/server";
import { buildLandingMetadata } from "@app/lib/landing/metadata";
import { fetchFooterData } from "@app/lib/landing/footer-data";
import { LandingPageView } from "@app/components/landing/landing-page-view";

export const revalidate = 60;

export function generateStaticParams() {
  return ["ru", "uk", "de", "es", "fr", "pl", "pt", "zh"].map((lang) => ({
    lang,
  }));
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return buildLandingMetadata(lang);
}

export default async function LanguageLandingPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const locale = getLocaleFromParams(lang);
  const dict = getLandingDictionary(locale);
  const footerData = await fetchFooterData(locale);

  return (
    <LandingPageView locale={locale} dict={dict} footerData={footerData} />
  );
}
