import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCollections, type CollectionListItem } from '@/shared/api/collectionsApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { Box, Typography, CircularProgress } from '@mui/material';

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, margin: '40px auto', px: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('footer.vocabularyCollections')}
            </Typography>
            {collections.length === 0 ? (
                <Typography color="text.secondary">{t('errors.notFound')}</Typography>
            ) : (
                <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0 }}>
                    {collections.map((item) => (
                        <Box component="li" key={item.id} sx={{ mb: 2 }}>
                            <Link
                                to={`/collections/${locale}/${item.slug}`}
                                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 16 }}
                            >
                                {(item.cover?.data?.attributes?.url ?? item.cover?.url) && (
                                    <Box
                                        component="img"
                                        src={(() => {
                                            const url = item.cover?.data?.attributes?.url ?? item.cover?.url ?? '';
                                            return url.startsWith('http') ? url : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
                                        })()}
                                        alt=""
                                        sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                )}
                                <Typography variant="h6">{item.title}</Typography>
                            </Link>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
