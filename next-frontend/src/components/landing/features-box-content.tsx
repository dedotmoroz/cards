"use client";

import Link from "next/link";
import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator, localizedPath } from "@app/lib/i18n/server";
import { AlIcon, ChromeIcon, ExcelIcon, MonitorIcon } from "@/shared/icons";
import {
  StyledAccentLink,
  StyledAIIcon,
  StyledBox,
  StyledChromeIcon,
  StyledDescription,
  StyledExcelIcon,
  StyledHeader,
  StyledHeight,
  StyledMonitorIcon,
  StyledTitle,
} from "@/widgets/landing/styled-components";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
};

export function FeaturesBoxContent({ locale, dict }: Props) {
  const t = createTranslator(dict);

  const features = [
    {
      icon: (
        <StyledAIIcon>
          <AlIcon color="#fff" />
        </StyledAIIcon>
      ),
      title: t("landing.features.contextAI.title"),
      subtitle: t("landing.features.contextAI.subtitle"),
      text: `${t("landing.features.contextAI.item1")}\n${t("landing.features.contextAI.item2")}\n${t("landing.features.contextAI.item3")}\n${t("landing.features.contextAI.accent")}`,
      link: null,
    },
    {
      icon: (
        <StyledChromeIcon>
          <ChromeIcon color="#fff" />
        </StyledChromeIcon>
      ),
      title: t("landing.features.chrome.title"),
      subtitle: t("landing.features.chrome.subtitle"),
      text: `${t("landing.features.chrome.description")}\n${t("landing.features.chrome.item1")}\n${t("landing.features.chrome.item2")}\n${t("landing.features.chrome.item3")}`,
      link: {
        href: localizedPath(locale, `/ecosystem/${locale}/chrome_extension`),
        label: t("landing.features.chrome.accent"),
      },
    },
    {
      icon: (
        <StyledExcelIcon>
          <ExcelIcon color="#fff" />
        </StyledExcelIcon>
      ),
      title: t("landing.features.importExport.title"),
      subtitle: t("landing.features.importExport.subtitle"),
      text: `${t("landing.features.importExport.item1")}\n${t("landing.features.importExport.item2")}\n${t("landing.features.importExport.item3")}\n${t("landing.features.importExport.accent")}`,
      link: null,
    },
    {
      icon: (
        <StyledMonitorIcon>
          <MonitorIcon color="#fff" />
        </StyledMonitorIcon>
      ),
      title: t("landing.features.adaptive.title"),
      subtitle: `${t("landing.features.adaptive.subtitle")} ${t("landing.features.adaptive.description")}`,
      text: `${t("landing.features.adaptive.item1")}\n${t("landing.features.adaptive.item2")}\n${t("landing.features.adaptive.item3")}\n${t("landing.features.adaptive.accent")}`,
      link: null,
    },
  ];

  return (
    <>
      {features.map((feature, index) => (
        <StyledBox key={index}>
          <StyledHeader>{feature.icon}</StyledHeader>
          <StyledDescription>
            <StyledTitle>{feature.title}</StyledTitle>
            <StyledHeight>{feature.subtitle}</StyledHeight>
            {feature.text}
            {feature.link ? (
              <Link href={feature.link.href} style={{ textDecoration: "none" }}>
                <StyledAccentLink as="span">{feature.link.label}</StyledAccentLink>
              </Link>
            ) : null}
          </StyledDescription>
        </StyledBox>
      ))}
    </>
  );
}
