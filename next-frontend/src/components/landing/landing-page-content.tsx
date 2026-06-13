"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";
import type { LandingPageProps } from "./types";
import { createTranslator } from "@app/lib/i18n/server";
import {
  StyledHeadlineContainer,
  StyledLandingContainer,
} from "@/pages/styled-components";
import { StyledImagesBox } from "@/widgets/landing/styled-components";
import { LandingHeader } from "./landing-header";
import { HeadlineContent } from "./headline-content";
import { ExampleCardContent } from "./example-card-content";
import { WhiteBlockContent } from "./white-block-content";
import { FeaturesBoxContent } from "./features-box-content";
import { RedBoxContent } from "./red-box-content";
import { LandingFooter } from "./landing-footer";

export function LandingPageContent({
  locale,
  dict,
  footerData,
}: LandingPageProps) {
  const t = createTranslator(dict);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <LandingHeader
        locale={locale}
        loginLabel={t("auth.login")}
        logoutLabel={t("auth.logout")}
      />
      <StyledLandingContainer>
        <StyledHeadlineContainer maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              alignItems: "top",
            }}
          >
            <Box>
              <HeadlineContent locale={locale} dict={dict} />
            </Box>
            <StyledImagesBox>
              <ExampleCardContent dict={dict} />
            </StyledImagesBox>
          </Box>
        </StyledHeadlineContainer>

        <StyledHeadlineContainer maxWidth="lg">
          <WhiteBlockContent dict={dict} />
        </StyledHeadlineContainer>

        <StyledHeadlineContainer maxWidth="lg" id="features-section">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 4,
            }}
          >
            <FeaturesBoxContent locale={locale} dict={dict} />
          </Box>
        </StyledHeadlineContainer>

        <StyledHeadlineContainer maxWidth="lg">
          <RedBoxContent locale={locale} dict={dict} />
        </StyledHeadlineContainer>
      </StyledLandingContainer>
      <LandingFooter locale={locale} dict={dict} footerData={footerData} />
    </>
  );
}
