import type { Metadata } from "next";
import { CollectionsListShell } from "@app/components/collections-list-shell";
import { getCollections } from "@app/lib/cms/collections";
import { DEFAULT_LOCALE } from "@app/lib/i18n";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Vocabulary Collections",
  description: "Thematic word collections for vocabulary learning",
};

export default async function CollectionsPage() {
  const locale = DEFAULT_LOCALE;
  const collections = await getCollections(locale).catch(() => []);

  return (
    <CollectionsListShell locale={locale} collections={collections} />
  );
}
