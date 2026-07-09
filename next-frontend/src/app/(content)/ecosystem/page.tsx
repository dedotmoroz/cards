import type { Metadata } from "next";
import { EcosystemsListShell } from "@app/components/ecosystems-list-shell";
import { getEcosystems } from "@app/lib/cms/ecosystems";
import { DEFAULT_LOCALE } from "@app/lib/i18n";
import { buildLocalizedHreflangAlternates } from "@app/lib/i18n/hreflang";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ecosystem",
  description: "KotCat ecosystem articles",
  alternates: buildLocalizedHreflangAlternates(DEFAULT_LOCALE, "/ecosystem"),
};

export default async function EcosystemListPage() {
  const locale = DEFAULT_LOCALE;
  const items = await getEcosystems(locale).catch(() => []);

  return (
    <EcosystemsListShell locale={locale} items={items} />
  );
}
