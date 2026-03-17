import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { getEcosystem, type EcosystemItem } from '@/shared/api/ecosystemsApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { PageLayout } from '@/entities';
import { PageLoader } from '@/shared/ui';
import { sanitizeHtml } from '@/shared/lib/sanitizeHtml';

function getMediaUrl(media: EcosystemItem['prevImg']): string {
    const url = media?.data?.attributes?.url ?? media?.url ?? '';
    if (!url) return '';
    return url.startsWith('http')
        ? url
        : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
}

export function EcosystemDetailPage() {
    const { locale, slug } = useParams<{ locale: string; slug: string }>();
    const [item, setItem] = useState<EcosystemItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!locale || !slug) return;
        getEcosystem(locale, slug)
            .then(setItem)
            .finally(() => setLoading(false));
    }, [locale, slug]);

    const cleanHtml = useMemo(() => sanitizeHtml(item?.content ?? ''), [item?.content]);
    const prevImgUrl = useMemo(() => getMediaUrl(item?.prevImg ?? null), [item?.prevImg]);

    useSEO({
        title: item ? (item.seoTitle ?? item.title ?? undefined) : undefined,
        description: item?.seoDescription ?? undefined,
        canonical: locale && slug ? `${SITE_BASE_URL}/ecosystem/${locale}/${slug}` : undefined,
        lang: locale ?? undefined,
    });

    if (loading) return <PageLoader />;
    if (!item) return <div>Ecosystem not found</div>;

    return (
        <PageLayout
            title={item.title ?? ''}
            backTo="/ecosystem"
            content={
                <Box>
                    {prevImgUrl ? (
                        <Box
                            component="img"
                            src={prevImgUrl}
                            alt=""
                            sx={{
                                width: '100%',
                                maxHeight: 320,
                                objectFit: 'cover',
                                borderRadius: 2,
                                mb: 2,
                            }}
                        />
                    ) : null}

                    {item.prevText ? (
                        <Box sx={{ mb: 2 }}>
                            <BlocksRenderer content={item.prevText as BlocksContent} />
                        </Box>
                    ) : null}

                    {cleanHtml ? (
                        <Box
                            sx={{
                                '& img': { maxWidth: '100%', height: 'auto' },
                                '& p': { marginTop: 0 },
                            }}
                            dangerouslySetInnerHTML={{ __html: cleanHtml }}
                        />
                    ) : null}
                </Box>
            }
        />
    );
}
