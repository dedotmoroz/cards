import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  SITE_BASE_URL,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@app/lib/i18n";
import { localizedPath, localePath } from "@app/lib/i18n";

function absoluteUrl(path: string): string {
  return `${SITE_BASE_URL}${path}`;
}

function withXDefault(
  languages: Record<string, string>,
  defaultUrl: string
): Record<string, string> {
  return { ...languages, "x-default": defaultUrl };
}

/** Home / marketing landing: `/` for en, `/ru` for ru, etc. */
export function buildHomeHreflangAlternates(
  locale: AppLocale
): NonNullable<Metadata["alternates"]> {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((lang) => [lang, absoluteUrl(localePath(lang))])
  );
  const defaultUrl = absoluteUrl(localePath(DEFAULT_LOCALE));

  return {
    canonical: absoluteUrl(localePath(locale)),
    languages: withXDefault(languages, defaultUrl),
  };
}

/** List and detail pages: `/collections` for en, `/ru/collections` for ru, etc. */
export function buildLocalizedHreflangAlternates(
  locale: AppLocale,
  path: string
): NonNullable<Metadata["alternates"]> {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((lang) => [
      lang,
      absoluteUrl(localizedPath(lang, path)),
    ])
  );
  const defaultUrl = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));

  return {
    canonical: absoluteUrl(localizedPath(locale, path)),
    languages: withXDefault(languages, defaultUrl),
  };
}
