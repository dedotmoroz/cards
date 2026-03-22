import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { getEcosystems, type EcosystemListItem } from '@/shared/api/ecosystemsApi';
import { STRAPI_URL } from '@/shared/api/strapiBase';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { HeaderCollection, PageLoader } from '@/shared/ui';
import {
    CollectionsListLayout,
    StyledList,
    StyledListItem,
    StyledLink,
    StyledCover,
} from '@/entities';
import { Footer } from '@/widgets/landing/footer.tsx';

function getImageUrl(item: EcosystemListItem): string {
    const url = item.prevImg?.data?.attributes?.url ?? item.prevImg?.url ?? '';
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = STRAPI_URL.startsWith('http') ? STRAPI_URL : origin;
    return `${base}${url}`;
}

export function EcosystemsListPage() {
    const { i18n, t } = useTranslation();
    const locale = i18n.language || 'en';
    const [items, setItems] = useState<EcosystemListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEcosystems(locale)
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [locale]);

    useSEO({
        title: t('seo.ecosystem.title', 'Ecosystem - KotCat'),
        description: t('seo.ecosystem.description', 'Ecosystem pages'),
        canonical: `${SITE_BASE_URL}/ecosystem`,
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
                <CollectionsListLayout title={t('footer.ecosystem', 'Ecosystem')}>
                    {items.length === 0 ? (
                        <Typography color="text.secondary">{t('errors.notFound')}</Typography>
                    ) : (
                        <StyledList>
                            {items.map((item) => {
                                const imageUrl = getImageUrl(item);
                                return (
                                    <StyledListItem key={item.id}>
                                        <StyledLink to={`/ecosystem/${locale}/${item.slug}`}>
                                            {imageUrl ? <StyledCover src={imageUrl} alt="" /> : null}
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" noWrap>
                                                    {item.title ?? ''}
                                                </Typography>
                                                {item.prevText ? (
                                                    <Box
                                                        sx={{
                                                            color: 'text.secondary',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            '& p': { margin: 0 },
                                                        }}
                                                    >
                                                        <BlocksRenderer content={item.prevText as BlocksContent} />
                                                    </Box>
                                                ) : null}
                                            </Box>
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
