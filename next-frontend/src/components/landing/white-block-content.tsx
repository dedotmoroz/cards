import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import styles from "./landing.module.css";

type Props = {
  dict: LandingDictionary;
};

export function WhiteBlockContent({ dict }: Props) {
  const t = createTranslator(dict);

  return (
    <div className={styles.whiteCard}>
      <h2 className={styles.whiteHeader}>{t("landing.context.title")}</h2>
      <div className={styles.whiteCardContainer}>
        <p className={styles.typographyStressed}>
          {t("landing.context.subtitle")}
        </p>
        <p className={styles.typographyOrdinary}>
          <span className={styles.typographyBold}>
            {t("landing.context.subtitleBold1")}
          </span>
          {t("landing.context.subtitle1")}
        </p>
        <p className={styles.typographyOrdinary}>
          <span className={styles.typographyBold}>
            {t("landing.context.subtitleBold2")}
          </span>
          {t("landing.context.subtitle2")}
        </p>
        <p className={styles.typographyOrdinary}>
          <span className={styles.typographyBold}>
            {t("landing.context.subtitleBold3")}
          </span>
          {t("landing.context.subtitle3")}
        </p>
      </div>
    </div>
  );
}
