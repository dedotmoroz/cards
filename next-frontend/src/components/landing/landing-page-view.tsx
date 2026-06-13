import type { LandingPageProps } from "./types";
import { createTranslator } from "@app/lib/i18n/server";
import { SetHtmlLang } from "./set-html-lang";
import { LandingHeader } from "./landing-header";
import { HeadlineContent } from "./headline-content";
import { HeroExampleSection } from "./hero-example-section";
import { WhiteBlockContent } from "./white-block-content";
import { FeaturesBoxContent } from "./features-box-content";
import { RedBoxContent } from "./red-box-content";
import { LandingFooter } from "./landing-footer";
import styles from "./landing.module.css";

export function LandingPageView({
  locale,
  dict,
  footerData,
}: LandingPageProps) {
  const t = createTranslator(dict);

  return (
    <>
      <SetHtmlLang locale={locale} />
      <LandingHeader
        locale={locale}
        loginLabel={t("auth.login")}
        logoutLabel={t("auth.logout")}
      />
      <main className={styles.landingContainer}>
        <section className={styles.headlineContainer}>
          <div className={styles.heroGrid}>
            <HeadlineContent locale={locale} dict={dict} />
            <HeroExampleSection dict={dict} />
          </div>
        </section>

        <section className={styles.headlineContainer}>
          <WhiteBlockContent dict={dict} />
        </section>

        <section className={styles.headlineContainer} id="features-section">
          <div className={styles.featuresGrid}>
            <FeaturesBoxContent locale={locale} dict={dict} />
          </div>
        </section>

        <section className={styles.headlineContainer}>
          <RedBoxContent locale={locale} dict={dict} />
        </section>
      </main>
      <LandingFooter locale={locale} dict={dict} footerData={footerData} />
    </>
  );
}
