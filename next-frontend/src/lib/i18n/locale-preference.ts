import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type AppLocale,
} from "@app/lib/i18n";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const I18NEXT_STORAGE_KEY = "i18nextLng";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function negotiateLocale(acceptLanguage: string | null): AppLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  for (const part of acceptLanguage.split(",")) {
    const code = part.trim().split(";")[0].split("-")[0].toLowerCase();
    if (isSupportedLocale(code)) return code;
  }

  return DEFAULT_LOCALE;
}

export function resolvePreferredLocale(
  cookieLocale: string | undefined,
  acceptLanguage: string | null,
): AppLocale {
  if (cookieLocale && isSupportedLocale(cookieLocale)) return cookieLocale;
  return negotiateLocale(acceptLanguage);
}

export function persistLocalePreference(locale: AppLocale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};SameSite=Lax`;
  localStorage.setItem(I18NEXT_STORAGE_KEY, locale);
}
