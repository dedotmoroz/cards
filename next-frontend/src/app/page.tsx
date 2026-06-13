import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@app/lib/i18n";
import { getLandingDictionary } from "@app/lib/i18n/server";
import { buildLandingMetadata } from "@app/lib/landing/metadata";
import { fetchFooterData } from "@app/lib/landing/footer-data";
import { LandingPageView } from "@app/components/landing/landing-page-view";

export const revalidate = 60;

export const metadata: Metadata = buildLandingMetadata(DEFAULT_LOCALE);

export default async function HomePage() {
  const locale = DEFAULT_LOCALE;
  const dict = getLandingDictionary(locale);
  const footerData = await fetchFooterData(locale);

  return (
    <LandingPageView locale={locale} dict={dict} footerData={footerData} />
  );
}
