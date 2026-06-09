export const SUPPORTED_LOCALES = [
  "en",
  "ru",
  "uk",
  "de",
  "es",
  "fr",
  "pl",
  "pt",
  "zh",
] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export function isSupportedLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_BASE_URL ?? "https://kotcat.com";
