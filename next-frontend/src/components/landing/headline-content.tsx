import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import { HeadlineActions } from "./headline-actions";
import styles from "./landing.module.css";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
};

export function HeadlineContent({ locale, dict }: Props) {
  const t = createTranslator(dict);

  return (
    <>
      <div className={styles.chip}>
        <span className={styles.chipText}>{t("landing.firstScreen.tag")}</span>
      </div>
      <h1 className={styles.firstScreenTitle}>
        {t("landing.firstScreen.title1")}{" "}
        <span className={styles.colorTitle}>{t("landing.firstScreen.title2")}</span>{" "}
        {t("landing.firstScreen.title3")}
      </h1>
      <p className={styles.firstScreenDescription}>
        {t("landing.firstScreen.description")}
      </p>
      <HeadlineActions
        locale={locale}
        startLabel={t("landing.firstScreen.button1")}
        continueLabel={t("learning.wantToContinue")}
        showFeaturesLabel={t("landing.firstScreen.button2")}
      />
    </>
  );
}
