import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
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
import { Footer } from '@/widgets/landing/footer.tsx';
import { HeaderCollection } from '@/shared/ui';

function getCoverUrl(item: CollectionListItem): string {
    const url = item.cover?.data?.attributes?.url ?? item.cover?.url ?? '';
    if (!url) return '';
    return url.startsWith('http') ? url : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
}

export function CollectionsListPage() {
    const { i18n, t } = useTranslation();
    const { lang } = useParams<{ lang?: string }>();
    const locale = i18n.language || 'en';
    const [collections, setCollections] = useState<CollectionListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!lang) return;
        const supported = ['en', 'ru', 'uk', 'de', 'es', 'fr', 'pl', 'pt', 'zh'];
        if (supported.includes(lang) && i18n.language !== lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n]);

    useEffect(() => {
        setLoading(true);
        getCollections(locale)
            .then(setCollections)
            .catch(() => setCollections([]))
            .finally(() => setLoading(false));
    }, [locale]);

    useSEO({
        title: t('seo.collections.title', 'Vocabulary Collections - KotCat'),
        description: t('seo.collections.description', 'Thematic word collections for vocabulary learning'),
        canonical: `${SITE_BASE_URL}${locale === 'en' ? '/collections' : `/${locale}/collections`}`,
        lang: locale,
    });

    if (loading) return <PageLoader />;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                boxSizing: 'border-box',
                pt: { xs: '56px', sm: '64px' },
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <HeaderCollection />
            <Box sx={{ flex: '1 1 auto' }}>
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
            </Box>
            <Box sx={{ mt: 'auto' }}>
                <Footer />
            </Box>
        </Box>
    );
}
