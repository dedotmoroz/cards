"use client";

import Link from "next/link";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  CollectionsListLayout,
  StyledList,
  StyledListItem,
  StyledCover,
} from "@/entities";
import {
  getEcosystemPreviewUrl,
  type EcosystemListItem,
} from "@app/lib/cms/ecosystems";
import { type AppLocale, localizedPath } from "@app/lib/i18n";
import { ContentShell } from "./content-shell";

type Props = {
  locale: string;
  items: EcosystemListItem[];
};

export function EcosystemsListView({ locale, items }: Props) {
  const { t } = useTranslation();

  return (
    <ContentShell>
      <CollectionsListLayout title={t("footer.ecosystem", "Ecosystem")}>
        {items.length === 0 ? (
          <Typography color="text.secondary">{t("errors.notFound")}</Typography>
        ) : (
          <StyledList>
            {items.map((item) => {
              const imgUrl = getEcosystemPreviewUrl(item);
              return (
                <StyledListItem key={item.id}>
                  <Link
                    href={localizedPath(locale as AppLocale, `/ecosystem/${item.slug}`)}
                    style={{ textDecoration: "none", color: "inherit", display: "flex", gap: 16, alignItems: "center" }}
                  >
                    {imgUrl ? <StyledCover src={imgUrl} alt="" /> : null}
                    <Typography variant="h6">{item.title ?? item.slug}</Typography>
                  </Link>
                </StyledListItem>
              );
            })}
          </StyledList>
        )}
      </CollectionsListLayout>
    </ContentShell>
  );
}
