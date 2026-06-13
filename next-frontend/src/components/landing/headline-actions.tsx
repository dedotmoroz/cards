"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/shared/store/authStore";
import { useNextNavigate } from "@app/lib/navigation/use-next-navigate";
import type { AppLocale } from "@app/lib/i18n";
import styles from "./landing.module.css";

function ArrowForwardIcon() {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
      />
    </svg>
  );
}

type Props = {
  locale: AppLocale;
  startLabel: string;
  continueLabel: string;
  showFeaturesLabel: string;
};

export function HeadlineActions({
  locale,
  startLabel,
  continueLabel,
  showFeaturesLabel,
}: Props) {
  const navigate = useNextNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const { isAuthenticated, createGuest, user } = useAuthStore();
  const [isRegistered, setIsRegistered] = useState(false);
  const [ctaLabel, setCtaLabel] = useState(startLabel);

  useEffect(() => {
    const sync = () => {
      const state = useAuthStore.getState();
      const registered = Boolean(state.user && !state.user.isGuest);
      setIsRegistered(registered);
      setCtaLabel(
        registered || state.isAuthenticated ? continueLabel : startLabel
      );
    };

    sync();

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(() => {
        void checkAuth().then(sync);
      });
      return () => cancelIdleCallback(id);
    }

    const timer = window.setTimeout(() => {
      void checkAuth().then(sync);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [checkAuth, continueLabel, startLabel]);

  const handleStartLearning = async () => {
    if (isAuthenticated) {
      navigate("/learn");
      return;
    }
    try {
      await createGuest(locale);
      navigate("/learn");
    } catch (error) {
      console.error("Failed to create guest:", error);
    }
  };

  return (
    <div className={styles.headlineActions}>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={() => void handleStartLearning()}
      >
        {ctaLabel}
        <ArrowForwardIcon />
      </button>
      {!isRegistered ? (
        <button
          type="button"
          className={styles.outlineButton}
          onClick={() => {
            document.getElementById("features-section")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          {showFeaturesLabel}
        </button>
      ) : null}
    </div>
  );
}
