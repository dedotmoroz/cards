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
  getCollectionCoverUrl,
  type CollectionListItem,
} from "@app/lib/cms/collections";
import { ContentShell } from "./content-shell";

type Props = {
  locale: string;
  collections: CollectionListItem[];
};

export function CollectionsListView({ locale, collections }: Props) {
  const { t } = useTranslation();

  return (
    <ContentShell>
      <CollectionsListLayout title={t("footer.vocabularyCollections")}>
        {collections.length === 0 ? (
          <Typography color="text.secondary">{t("errors.notFound")}</Typography>
        ) : (
          <StyledList>
            {collections.map((item) => {
              const coverUrl = getCollectionCoverUrl(item);
              return (
                <StyledListItem key={item.id}>
                  <Link
                    href={`/collections/${locale}/${item.slug}`}
                    style={{ textDecoration: "none", color: "inherit", display: "flex", gap: 16, alignItems: "center" }}
                  >
                    {coverUrl ? <StyledCover src={coverUrl} alt="" /> : null}
                    <Typography variant="h6">{item.title}</Typography>
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
