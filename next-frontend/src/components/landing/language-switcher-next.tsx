"use client";

import type { AppLocale } from "@app/lib/i18n";
import { localePath } from "@app/lib/i18n/server";
import styles from "./landing.module.css";

const languages: { code: AppLocale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

type Props = {
  locale: AppLocale;
};

export function LanguageSwitcherNext({ locale }: Props) {
  return (
    <div className={styles.langSelectWrap}>
      <select
        className={styles.langSelect}
        value={locale}
        aria-label="Language"
        onChange={(event) => {
          window.location.assign(localePath(event.target.value as AppLocale));
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
