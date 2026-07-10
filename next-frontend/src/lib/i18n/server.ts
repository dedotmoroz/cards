import type { AppLocale } from "@app/lib/i18n";
import { DEFAULT_LOCALE, isSupportedLocale } from "@app/lib/i18n";

export { localePath, localizedPath } from "@app/lib/i18n";

import enCommon from "@/locales/en/common.json";
import ruCommon from "@/locales/ru/common.json";
import ukCommon from "@/locales/uk/common.json";
import deCommon from "@/locales/de/common.json";
import esCommon from "@/locales/es/common.json";
import frCommon from "@/locales/fr/common.json";
import plCommon from "@/locales/pl/common.json";
import ptCommon from "@/locales/pt/common.json";
import zhCommon from "@/locales/zh/common.json";

export type LandingDictionary = Record<string, unknown>;

const dictionaries: Record<AppLocale, LandingDictionary> = {
  en: enCommon,
  ru: ruCommon,
  uk: ukCommon,
  de: deCommon,
  es: esCommon,
  fr: frCommon,
  pl: plCommon,
  pt: ptCommon,
  zh: zhCommon,
};

export function getLandingDictionary(locale: AppLocale): LandingDictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export type Translator = (key: string) => string;

export function createTranslator(dict: LandingDictionary): Translator {
  return (key: string) => {
    const parts = key.split(".");
    let value: unknown = dict;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  };
}

export function getLocaleFromParams(lang?: string): AppLocale {
  if (!lang) return DEFAULT_LOCALE;
  return isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
}
