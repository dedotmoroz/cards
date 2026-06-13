"use client";

import { Box } from "@mui/material";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator } from "@app/lib/i18n/server";
import { StyledWordIcon } from "@/shared/ui/logo/styled-components";
import {
  StyledBookIcon,
  StyledColorText,
  StyledExampleCard,
  StyledExampleHeader,
  StyledSideA,
  StyledSideB,
  StyledTranslateBlock,
} from "@/widgets/landing/styled-components";

type Props = {
  dict: LandingDictionary;
};

export function ExampleCardContent({ dict }: Props) {
  const t = createTranslator(dict);

  return (
    <StyledExampleCard>
      <StyledExampleHeader>
        <StyledBookIcon>
          <StyledWordIcon color="#fff" />
        </StyledBookIcon>
        <Box>
          <StyledSideA>{t("landing.exampleCard.word")}</StyledSideA>
          <StyledSideB>{t("landing.exampleCard.translation")}</StyledSideB>
        </Box>
      </StyledExampleHeader>
      <StyledTranslateBlock>
        Being an <StyledColorText>overachiever</StyledColorText> can sometimes
        lead to communication issues because others may feel pressured to meet
        your high standards.
      </StyledTranslateBlock>
    </StyledExampleCard>
  );
}
