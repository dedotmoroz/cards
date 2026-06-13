import type { Metadata } from "next";
import type { AppLocale } from "@app/lib/i18n";
import { SITE_BASE_URL, SUPPORTED_LOCALES } from "@app/lib/i18n";
import {
  createTranslator,
  getLandingDictionary,
  localePath,
} from "@app/lib/i18n/server";

export function buildLandingMetadata(locale: AppLocale): Metadata {
  const t = createTranslator(getLandingDictionary(locale));
  const canonical = `${SITE_BASE_URL}${localePath(locale)}`;

  return {
    title: t("seo.landing.title"),
    description: t("seo.landing.description"),
    keywords: t("seo.keywords"),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((lang) => [
          lang,
          `${SITE_BASE_URL}${localePath(lang)}`,
        ])
      ),
    },
  };
}
