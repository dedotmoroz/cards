import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageShell } from "@app/components/landing-page-shell";
import { isSupportedLocale } from "@app/lib/i18n";

export function generateStaticParams() {
  return ["ru", "uk", "de", "es", "fr", "pl", "pt", "zh"].map((lang) => ({
    lang,
  }));
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return { title: "KotCat", alternates: { canonical: `/${lang}` } };
}

export default async function LanguageLandingPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return <LandingPageShell locale={lang} />;
}
