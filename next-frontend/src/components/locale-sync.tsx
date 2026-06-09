"use client";

import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { isSupportedLocale, type AppLocale } from "@app/lib/i18n";

type Props = {
  locale: string;
};

/**
 * Syncs i18next UI language with the locale from the Next.js URL segment.
 * Without this, LanguageDetector (localStorage / navigator) keeps Russian on /en, etc.
 */
export function LocaleSync({ locale }: Props) {
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    if (!isSupportedLocale(locale)) return;
    const lng = locale as AppLocale;
    if (i18n.language !== lng) {
      void i18n.changeLanguage(lng);
    }
    document.documentElement.lang = lng;
  }, [locale, i18n]);

  return null;
}
