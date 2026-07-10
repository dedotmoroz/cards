import Link from "next/link";
import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator, localizedPath } from "@app/lib/i18n/server";
import type { FooterData } from "@app/lib/landing/footer-data";
import styles from "./landing.module.css";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
  footerData: FooterData;
};

export function LandingFooter({ locale, dict, footerData }: Props) {
  const t = createTranslator(dict);
  const { pages, collections, ecosystems } = footerData;

  const hasLinks =
    collections.length > 0 || ecosystems.length > 0 || pages.length > 0;

  if (!hasLinks) return <footer className={styles.footer} />;

  return (
    <footer className={styles.footer}>
      <nav className={styles.footerLinks} aria-label="Footer">
        {collections.length > 0 ? (
          <Link href={localizedPath(locale, "/collections")}>
            {t("footer.vocabularyCollections")}
          </Link>
        ) : null}
        {ecosystems.length > 0 ? (
          <Link href={localizedPath(locale, "/ecosystem")}>
            {t("footer.ecosystem")}
          </Link>
        ) : null}
        {pages.map((page) => (
          <Link key={page.slug} href={localizedPath(locale, `/p/${page.slug}`)}>
            {page.title}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
