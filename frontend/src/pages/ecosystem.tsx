import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { getEcosystem, type EcosystemItem } from '@/shared/api/ecosystemsApi';
import { STRAPI_URL } from '@/shared/api/strapiBase';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { PageLayout } from '@/entities';
import { HeaderCollection, PageLoader } from '@/shared/ui';
import { Footer } from '@/widgets/landing/footer.tsx';

type ImgMeta = { src: string; width?: number; height?: number; alt?: string };

function getImages(images: EcosystemItem['images']): ImgMeta[] {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = STRAPI_URL.startsWith('http') ? STRAPI_URL : origin;

    // Strapi v5 often returns array of files: [{ url: "/uploads/..." }, ...]
    if (Array.isArray(images)) {
        return images
            .map((x) => x as { url?: string; width?: number; height?: number; alternativeText?: string } | null)
            .filter((x): x is { url?: string; width?: number; height?: number; alternativeText?: string } => Boolean(x))
            .map((x) => ({
                src: x.url ? (x.url.startsWith('http') ? x.url : `${base}${x.url}`) : '',
                width: x.width,
                height: x.height,
                alt: x.alternativeText ?? '',
            }))
            .filter((x) => Boolean(x.src));
    }

    // Strapi v4 style: { data: [{ attributes: { url } }] }
    const dataList =
        (images as {
            data?: Array<{
                attributes?: { url?: string; width?: number; height?: number; alternativeText?: string };
            }>;
        } | null | undefined)?.data ??
        [];

    return dataList
        .map((x) => x.attributes)
        .filter(
            (a): a is { url?: string; width?: number; height?: number; alternativeText?: string } =>
                Boolean(a)
        )
        .map((a) => ({
            src: a.url ? (a.url.startsWith('http') ? a.url : `${base}${a.url}`) : '',
            width: a.width,
            height: a.height,
            alt: a.alternativeText ?? '',
        }))
        .filter((x) => Boolean(x.src));
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

    const images = getImages(item.images ?? null);

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
                <PageLayout
                    title={item.title ?? ''}
                    backTo="/ecosystem"
                    content={
                        <Box>
                            {images.length > 0 ? (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                        gap: 1,
                                        mb: 2,
                                    }}
                                >
                                    {images.map((img, idx) => (
                                        <Box
                                            key={`${img.src}-${idx}`}
                                            component="img"
                                            src={img.src}
                                            alt={img.alt ?? ''}
                                            width={img.width}
                                            height={img.height}
                                            loading="lazy"
                                            sx={{
                                                aspectRatio:
                                                    img.width && img.height
                                                        ? `${img.width}/${img.height}`
                                                        : undefined,
                                            }}
                                        />
                                    ))}
                                </Box>
                            ) : null}

                            {item.contentBlock ? (
                                <Box sx={{ '& img': { maxWidth: '100%', height: 'auto' } }}>
                                    <BlocksRenderer content={item.contentBlock as BlocksContent} />
                                </Box>
                            ) : null}
                        </Box>
                    }
                />
            </Box>
            <Box sx={{ mt: 'auto', pt: 5 }}>
                <Footer />
            </Box>
        </Box>
    );
}
