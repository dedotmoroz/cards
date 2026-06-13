import type { AppLocale } from "@app/lib/i18n";
import type { FooterData } from "@app/lib/landing/footer-data";
import type { LandingDictionary } from "@app/lib/i18n/server";

export type LandingPageProps = {
  locale: AppLocale;
  dict: LandingDictionary;
  footerData: FooterData;
};
