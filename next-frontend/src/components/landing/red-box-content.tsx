"use client";

import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import {
  StyledGradientCard,
  StyledRedContainer,
  StyledRedContent,
  StyledRedDescription,
  StyledRedHeader,
} from "@/widgets/landing/styled-components";
import { RedBoxCta } from "./red-box-cta";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
};

export function RedBoxContent({ locale, dict }: Props) {
  const t = createTranslator(dict);

  return (
    <StyledGradientCard>
      <StyledRedContainer>
        <StyledRedHeader>{t("landing.hero.title")}</StyledRedHeader>
        <StyledRedDescription>{t("landing.hero.description")}</StyledRedDescription>
        <StyledRedContent>
          <RedBoxCta
            locale={locale}
            buttonLabel={t("landing.hero.button")}
            continueLabel={t("learning.wantToContinue")}
          />
        </StyledRedContent>
      </StyledRedContainer>
    </StyledGradientCard>
  );
}
