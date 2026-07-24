import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import kotcatImg from "@/shared/images/kotcat.png";
import {
  ExampleCardContent,
  type ExampleContext,
} from "./example-card-content";
import styles from "./landing.module.css";

type Props = {
  dict: LandingDictionary;
};

function isExampleContext(item: unknown): item is ExampleContext {
  if (!item || typeof item !== "object") return false;
  const value = item as { text?: unknown; translation?: unknown };
  return typeof value.text === "string" && typeof value.translation === "string";
}

function getContexts(dict: LandingDictionary): ExampleContext[] {
  const raw = (dict as { landing?: { exampleCard?: { contexts?: unknown } } })
    .landing?.exampleCard?.contexts;

  if (Array.isArray(raw) && raw.every(isExampleContext)) {
    return raw;
  }

  return [];
}

export function HeroExampleSection({ dict }: Props) {
  const t = createTranslator(dict);

  return (
    <div
      className={styles.imagesBox}
      style={{
        backgroundImage: `url(${kotcatImg.src})`,
      }}
    >
      <ExampleCardContent
        word={t("landing.exampleCard.word")}
        translation={t("landing.exampleCard.translation")}
        contexts={getContexts(dict)}
      />
    </div>
  );
}
