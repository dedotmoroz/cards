import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { getCollection, type CollectionItem } from '@/shared/api/collectionsApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { Box, Typography, CircularProgress } from '@mui/material';

export function CollectionDetailPage() {
    const { locale, slug } = useParams<{ locale: string; slug: string }>();
    const [collection, setCollection] = useState<CollectionItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!locale || !slug) return;
        getCollection(locale, slug)
            .then(setCollection)
            .finally(() => setLoading(false));
    }, [locale, slug]);

    useSEO({
        title: collection ? (collection.seoTitle ?? collection.title) : undefined,
        description: collection?.seoDescription ?? undefined,
        canonical: locale && slug ? `${SITE_BASE_URL}/collections/${locale}/${slug}` : undefined,
        lang: locale ?? undefined,
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                <CircularProgress />
            </Box>
        );
    }
    if (!collection) {
        return (
            <Box sx={{ maxWidth: 800, margin: '40px auto', px: 2 }}>
                <Typography color="error">Collection not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, margin: '40px auto', px: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {collection.title}
            </Typography>
            {collection.content ? (
                <BlocksRenderer content={collection.content as BlocksContent} />
            ) : null}
        </Box>
    );
}
