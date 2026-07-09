import type { Metadata } from "next";
import type { AppLocale } from "@app/lib/i18n";
import { buildHomeHreflangAlternates } from "@app/lib/i18n/hreflang";
import {
  createTranslator,
  getLandingDictionary,
} from "@app/lib/i18n/server";

export function buildLandingMetadata(locale: AppLocale): Metadata {
  const t = createTranslator(getLandingDictionary(locale));

  return {
    title: t("seo.landing.title"),
    description: t("seo.landing.description"),
    keywords: t("seo.keywords"),
    alternates: buildHomeHreflangAlternates(locale),
  };
}
