import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import { WordIcon } from "@/shared/icons/word-icon";
import styles from "./landing.module.css";

type Props = {
  dict: LandingDictionary;
};

export function ExampleCardContent({ dict }: Props) {
  const t = createTranslator(dict);

  return (
    <div className={styles.exampleCard}>
      <div className={styles.exampleHeader}>
        <div className={styles.bookIcon}>
          <WordIcon color="#fff" />
        </div>
        <div>
          <div className={styles.sideA}>{t("landing.exampleCard.word")}</div>
          <div className={styles.sideB}>{t("landing.exampleCard.translation")}</div>
        </div>
      </div>
      <div className={styles.translateBlock}>
        Being an <span className={styles.colorText}>overachiever</span> can sometimes
        lead to communication issues because others may feel pressured to meet
        your high standards.
      </div>
    </div>
  );
}
