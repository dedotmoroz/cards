"use client";

import { useEffect } from "react";
import type { AppLocale } from "@app/lib/i18n";
import { DEFAULT_LOCALE, isSupportedLocale } from "@app/lib/i18n";
import { persistLocalePreference } from "@app/lib/i18n/locale-preference";

export function SetHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    // Only persist on localized routes (/ru, /es, …). The default `/` page must not
    // overwrite a preference the user already chose — middleware reads the cookie.
    if (isSupportedLocale(locale) && locale !== DEFAULT_LOCALE) {
      persistLocalePreference(locale as AppLocale);
    }
  }, [locale]);

  return null;
}
