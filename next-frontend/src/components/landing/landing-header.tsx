import Link from "next/link";
import type { AppLocale } from "@app/lib/i18n";
import { localePath } from "@app/lib/i18n/server";
import { LanguageSwitcherNext } from "./language-switcher-next";
import { LandingHeaderAuth } from "./landing-header-auth";
import styles from "./landing.module.css";

type Props = {
  locale: AppLocale;
  loginLabel: string;
  logoutLabel: string;
};

export function LandingHeader({ locale, loginLabel, logoutLabel }: Props) {
  return (
    <header className={styles.headerTop}>
      <Link href={localePath(locale)} className={styles.logoLink} aria-label="KotCat">
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            background: "linear-gradient(90deg, #fff 0%, #f0e6ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          KotCat
        </span>
      </Link>
      <div className={styles.headerActions}>
        <LanguageSwitcherNext locale={locale} />
        <LandingHeaderAuth loginLabel={loginLabel} logoutLabel={logoutLabel} />
      </div>
    </header>
  );
}
