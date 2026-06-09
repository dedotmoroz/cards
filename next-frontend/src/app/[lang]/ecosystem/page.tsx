import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EcosystemsListShell } from "@app/components/ecosystems-list-shell";
import { getEcosystems } from "@app/lib/cms/ecosystems";
import { isSupportedLocale } from "@app/lib/i18n";

export const revalidate = 60;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) return {};
  return { title: "Ecosystem", alternates: { canonical: `/${lang}/ecosystem` } };
}

export default async function LocalizedEcosystemListPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const items = await getEcosystems(lang).catch(() => []);

  return (
    <EcosystemsListShell locale={lang} items={items} />
  );
}
