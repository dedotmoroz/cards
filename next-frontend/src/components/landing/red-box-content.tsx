import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import { RedBoxCta } from "./red-box-cta";
import styles from "./landing.module.css";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
};

export function RedBoxContent({ locale, dict }: Props) {
  const t = createTranslator(dict);

  return (
    <div className={styles.gradientCard}>
      <div className={styles.redContainer}>
        <h2 className={styles.redHeader}>{t("landing.hero.title")}</h2>
        <p className={styles.redDescription}>{t("landing.hero.description")}</p>
        <div className={styles.redContent}>
          <RedBoxCta
            locale={locale}
            buttonLabel={t("landing.hero.button")}
            continueLabel={t("learning.wantToContinue")}
          />
        </div>
      </div>
    </div>
  );
}
