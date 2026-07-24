"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { WordIcon } from "@/shared/icons/word-icon";
import { EXAMPLE_CARD_TIMINGS } from "./example-card-config";
import styles from "./landing.module.css";

export type ExampleContext = {
  text: string;
  translation: string;
};

type Props = {
  word: string;
  translation: string;
  contexts: ExampleContext[];
};

function highlightWord(text: string, word: string) {
  const index = text.toLowerCase().indexOf(word.toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + word.length);
  const after = text.slice(index + word.length);

  return (
    <>
      {before}
      <span className={styles.colorText}>{match}</span>
      {after}
    </>
  );
}

export function ExampleCardContent({ word, translation, contexts }: Props) {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [index, setIndex] = useState(0);
  const [slideIn, setSlideIn] = useState(true);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      setPhase("ready");
      setSlideIn(true);
    }, EXAMPLE_CARD_TIMINGS.loadingMs);

    return () => window.clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (phase !== "ready" || contexts.length <= 1) return;

    let exitTimer: number | undefined;
    const interval = window.setInterval(() => {
      setSlideIn(false);
      exitTimer = window.setTimeout(() => {
        setIndex((current) => (current + 1) % contexts.length);
        setSlideIn(true);
      }, EXAMPLE_CARD_TIMINGS.slideMs);
    }, EXAMPLE_CARD_TIMINGS.carouselIntervalMs);

    return () => {
      window.clearInterval(interval);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
    };
  }, [phase, contexts.length]);

  const currentContext = contexts[index];

  return (
    <div
      className={styles.exampleCard}
      style={
        {
          "--example-card-slide-ms": `${EXAMPLE_CARD_TIMINGS.slideMs}ms`,
        } as CSSProperties
      }
    >
      <div className={styles.exampleHeader}>
        <div className={styles.bookIcon}>
          <WordIcon color="#fff" width={24} height={24} />
        </div>
        <div>
          <div className={styles.sideA}>{word}</div>
          <div className={styles.sideB}>{translation}</div>
        </div>
      </div>
      <div className={styles.translateBlock}>
        <div className={styles.contextViewport}>
          {phase === "loading" ? (
            <div className={styles.contextLoader} aria-hidden>
              <span className={styles.contextSpinner} />
            </div>
          ) : currentContext ? (
            <div
              key={index}
              className={`${styles.contextSlide} ${
                slideIn ? styles.contextSlideIn : styles.contextSlideOut
              }`}
            >
              <div className={styles.contextColumns}>
                <div className={styles.contextText}>
                  {highlightWord(currentContext.text, word)}
                </div>
                <div className={styles.contextTranslation}>
                  {currentContext.translation}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
