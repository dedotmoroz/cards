"use client";

import type { EcosystemListItem } from "@app/lib/cms/ecosystems";
import { LocaleSync } from "@app/components/locale-sync";
import { EcosystemsListView } from "@app/components/ecosystems-list-view";

export function EcosystemsListShell(props: {
  locale: string;
  items: EcosystemListItem[];
}) {
  return (
    <>
      <LocaleSync locale={props.locale} />
      <EcosystemsListView locale={props.locale} items={props.items} />
    </>
  );
}
