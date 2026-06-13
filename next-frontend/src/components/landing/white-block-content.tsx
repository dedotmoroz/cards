"use client";

import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import {
  StyledTypographyBold,
  StyledTypographyOrdinary,
  StyledTypographyStressed,
  StyledWhiteCard,
  StyledWhiteCardContainer,
  StyledWhiteHeader,
} from "@/widgets/landing/styled-components";

type Props = {
  dict: LandingDictionary;
};

export function WhiteBlockContent({ dict }: Props) {
  const t = createTranslator(dict);

  return (
    <StyledWhiteCard>
      <StyledWhiteHeader>{t("landing.context.title")}</StyledWhiteHeader>
      <StyledWhiteCardContainer>
        <StyledTypographyStressed>
          {t("landing.context.subtitle")}
        </StyledTypographyStressed>
        <StyledTypographyOrdinary>
          <StyledTypographyBold>
            {t("landing.context.subtitleBold1")}
          </StyledTypographyBold>
          {t("landing.context.subtitle1")}
        </StyledTypographyOrdinary>
        <StyledTypographyOrdinary>
          <StyledTypographyBold>
            {t("landing.context.subtitleBold2")}
          </StyledTypographyBold>
          {t("landing.context.subtitle2")}
        </StyledTypographyOrdinary>
        <StyledTypographyOrdinary>
          <StyledTypographyBold>
            {t("landing.context.subtitleBold3")}
          </StyledTypographyBold>
          {t("landing.context.subtitle3")}
        </StyledTypographyOrdinary>
      </StyledWhiteCardContainer>
    </StyledWhiteCard>
  );
}
