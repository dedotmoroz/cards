import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { getEcosystem, type EcosystemItem } from '@/shared/api/ecosystemsApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { PageLayout } from '@/entities';
import { PageLoader } from '@/shared/ui';

function getImagesUrls(images: EcosystemItem['images']): string[] {
    const list = images?.data ?? [];
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return list
        .map((x) => x.attributes?.url ?? '')
        .filter(Boolean)
        .map((url) => (url.startsWith('http') ? url : `${origin}${url}`));
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

    useSEO({
        title: item ? (item.seoTitle ?? item.title ?? undefined) : undefined,
        description: item?.seoDescription ?? undefined,
        canonical: locale && slug ? `${SITE_BASE_URL}/ecosystem/${locale}/${slug}` : undefined,
        lang: locale ?? undefined,
    });

    if (loading) return <PageLoader />;
    if (!item) return <div>Ecosystem not found</div>;

    const imagesUrls = getImagesUrls(item.images ?? null);

    return (
        <PageLayout
            title={item.title ?? ''}
            backTo="/ecosystem"
            content={
                <Box>
                    {imagesUrls.length > 0 ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: 1,
                                mb: 2,
                            }}
                        >
                            {imagesUrls.map((url, idx) => (
                                <Box
                                    key={`${url}-${idx}`}
                                    component="img"
                                    src={url}
                                    alt=""
                                    loading="lazy"
                                    sx={{
                                        width: '100%',
                                        height: 220,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                    }}
                                />
                            ))}
                        </Box>
                    ) : null}

                    {item.content ? (
                        <Box sx={{ '& img': { maxWidth: '100%', height: 'auto' } }}>
                            <BlocksRenderer content={item.content as BlocksContent} />
                        </Box>
                    ) : null}
                </Box>
            }
        />
    );
}
