"use client";

import { Box } from "@mui/material";
import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import { useAuthStore } from "@/shared/store/authStore";
import {
  StyledChip,
  StyledColorTitle,
  StyledFirstScreenDescription,
  StyledFirstScreenTitle,
  StyledFS,
} from "@/widgets/landing/styled-components";
import { StartLearningActions } from "./start-learning-actions";
import { ScrollToFeaturesButton } from "./scroll-to-features-button";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
};

export function HeadlineContent({ locale, dict }: Props) {
  const t = createTranslator(dict);
  const user = useAuthStore((s) => s.user);
  const isRegistered = Boolean(user && !user.isGuest);

  return (
    <>
      <StyledChip label={<StyledFS>{t("landing.firstScreen.tag")}</StyledFS>} />
      <StyledFirstScreenTitle>
        {t("landing.firstScreen.title1")}{" "}
        <StyledColorTitle>{t("landing.firstScreen.title2")}</StyledColorTitle>{" "}
        {t("landing.firstScreen.title3")}
      </StyledFirstScreenTitle>
      <StyledFirstScreenDescription>
        {t("landing.firstScreen.description")}
      </StyledFirstScreenDescription>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <StartLearningActions
          locale={locale}
          startLabel={t("landing.firstScreen.button1")}
          continueLabel={t("learning.wantToContinue")}
        />
        {!isRegistered && (
          <ScrollToFeaturesButton label={t("landing.firstScreen.button2")} />
        )}
      </Box>
    </>
  );
}
