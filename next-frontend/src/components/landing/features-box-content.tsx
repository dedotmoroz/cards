import Link from "next/link";
import type { AppLocale } from "@app/lib/i18n";
import type { LandingDictionary } from "@app/lib/i18n/server";
import { createTranslator, localizedPath } from "@app/lib/i18n/server";
import { AlIcon, ChromeIcon, ExcelIcon, MonitorIcon } from "@/shared/icons";
import styles from "./landing.module.css";

type Props = {
  locale: AppLocale;
  dict: LandingDictionary;
};

export function FeaturesBoxContent({ locale, dict }: Props) {
  const t = createTranslator(dict);

  const features = [
    {
      iconClass: styles.featureIconAi,
      icon: <AlIcon color="#fff" />,
      title: t("landing.features.contextAI.title"),
      subtitle: t("landing.features.contextAI.subtitle"),
      text: `${t("landing.features.contextAI.item1")}\n${t("landing.features.contextAI.item2")}\n${t("landing.features.contextAI.item3")}\n${t("landing.features.contextAI.accent")}`,
      link: null,
    },
    {
      iconClass: styles.featureIconChrome,
      icon: <ChromeIcon color="#fff" />,
      title: t("landing.features.chrome.title"),
      subtitle: t("landing.features.chrome.subtitle"),
      text: `${t("landing.features.chrome.description")}\n${t("landing.features.chrome.item1")}\n${t("landing.features.chrome.item2")}\n${t("landing.features.chrome.item3")}`,
      link: {
        href: localizedPath(locale, `/ecosystem/${locale}/chrome_extension`),
        label: t("landing.features.chrome.accent"),
      },
    },
    {
      iconClass: styles.featureIconExcel,
      icon: <ExcelIcon color="#fff" />,
      title: t("landing.features.importExport.title"),
      subtitle: t("landing.features.importExport.subtitle"),
      text: `${t("landing.features.importExport.item1")}\n${t("landing.features.importExport.item2")}\n${t("landing.features.importExport.item3")}\n${t("landing.features.importExport.accent")}`,
      link: null,
    },
    {
      iconClass: styles.featureIconMonitor,
      icon: <MonitorIcon color="#fff" />,
      title: t("landing.features.adaptive.title"),
      subtitle: `${t("landing.features.adaptive.subtitle")} ${t("landing.features.adaptive.description")}`,
      text: `${t("landing.features.adaptive.item1")}\n${t("landing.features.adaptive.item2")}\n${t("landing.features.adaptive.item3")}\n${t("landing.features.adaptive.accent")}`,
      link: null,
    },
  ];

  return (
    <>
      {features.map((feature, index) => (
        <div className={styles.featureBox} key={index}>
          <div className={styles.featureHeader}>
            <div className={feature.iconClass}>{feature.icon}</div>
          </div>
          <div className={styles.featureDescription}>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <div className={styles.featureSubtitle}>{feature.subtitle}</div>
            {feature.text}
            {feature.link ? (
              <Link href={feature.link.href} className={styles.accentLink}>
                {feature.link.label}
              </Link>
            ) : null}
          </div>
        </div>
      ))}
    </>
  );
}
