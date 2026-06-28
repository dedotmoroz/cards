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
        <div className={styles.typographyStressed}>
          {t("landing.context.subtitle")}
        </div>
        <div className={styles.typographyOrdinary}>
          <div className={styles.typographyBold}>
            {t("landing.context.subtitleBold1")}
          </div>
          {t("landing.context.subtitle1")}
        </div>
        <div className={styles.typographyOrdinary}>
          <div className={styles.typographyBold}>
            {t("landing.context.subtitleBold2")}
          </div>
          {t("landing.context.subtitle2")}
        </div>
        <div className={styles.typographyOrdinary}>
          <div className={styles.typographyBold}>
            {t("landing.context.subtitleBold3")}
          </div>
          {t("landing.context.subtitle3")}
        </div>
      </div>
    </div>
  );
}
