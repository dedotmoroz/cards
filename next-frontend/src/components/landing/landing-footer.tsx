"use client";

import Link from "next/link";
import { Typography } from "@mui/material";
import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator, localizedPath } from "@app/lib/i18n/server";
import type { FooterData } from "@app/lib/landing/footer-data";
import { StyledFooter, StyledFooterLinks } from "@/widgets/landing/styled-components";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
  footerData: FooterData;
};

export function LandingFooter({ locale, dict, footerData }: Props) {
  const t = createTranslator(dict);
  const { pages, collections, ecosystems } = footerData;

  const hasLinks =
    collections.length > 0 || ecosystems.length > 0 || pages.length > 0;

  if (!hasLinks) return <StyledFooter />;

  return (
    <StyledFooter>
      <StyledFooterLinks>
        {collections.length > 0 && (
          <Link
            href={localizedPath(locale, "/collections")}
            style={{ textDecoration: "none" }}
          >
            <Typography component="span" variant="body2">
              {t("footer.vocabularyCollections")}
            </Typography>
          </Link>
        )}
        {ecosystems.length > 0 && (
          <Link
            href={localizedPath(locale, "/ecosystem")}
            style={{ textDecoration: "none" }}
          >
            <Typography component="span" variant="body2">
              {t("footer.ecosystem")}
            </Typography>
          </Link>
        )}
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/p/${locale}/${page.slug}`}
            style={{ textDecoration: "none" }}
          >
            <Typography component="span" variant="body2">
              {page.title}
            </Typography>
          </Link>
        ))}
      </StyledFooterLinks>
    </StyledFooter>
  );
}
