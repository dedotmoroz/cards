import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { getCollections, type CollectionListItem } from '@/shared/api/collectionsApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { PageLoader } from '@/shared/ui';
import {
    CollectionsListLayout,
    StyledList,
    StyledListItem,
    StyledLink,
    StyledCover,
} from '@/entities';

function getCoverUrl(item: CollectionListItem): string {
    const url = item.cover?.data?.attributes?.url ?? item.cover?.url ?? '';
    if (!url) return '';
    return url.startsWith('http') ? url : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
}

export function CollectionsListPage() {
    const { i18n, t } = useTranslation();
    const locale = i18n.language || 'en';
    const [collections, setCollections] = useState<CollectionListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCollections(locale)
            .then(setCollections)
            .catch(() => setCollections([]))
            .finally(() => setLoading(false));
    }, [locale]);

    useSEO({
        title: t('seo.collections.title', 'Vocabulary Collections - KotCat'),
        description: t('seo.collections.description', 'Thematic word collections for vocabulary learning'),
        canonical: `${SITE_BASE_URL}/collections`,
        lang: locale,
    });

    if (loading) return <PageLoader />;

    return (
        <CollectionsListLayout title={t('footer.vocabularyCollections')}>
            {collections.length === 0 ? (
                <Typography color="text.secondary">{t('errors.notFound')}</Typography>
            ) : (
                <StyledList>
                    {collections.map((item) => {
                        const coverUrl = getCoverUrl(item);
                        return (
                            <StyledListItem key={item.id}>
                                <StyledLink to={`/collections/${locale}/${item.slug}`}>
                                    {coverUrl ? <StyledCover src={coverUrl} alt="" /> : null}
                                    <Typography variant="h6">{item.title}</Typography>
                                </StyledLink>
                            </StyledListItem>
                        );
                    })}
                </StyledList>
            )}
        </CollectionsListLayout>
    );
}
