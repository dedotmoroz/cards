import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { getCollection, type CollectionItem } from '@/shared/api/collectionsApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { PageLayout } from '@/entities';
import { PageLoader } from '@/shared/ui';

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

    if (loading) return <PageLoader />;
    if (!collection) return <div>Collection not found</div>;

    return (
        <PageLayout
            title={collection.title}
            content={
                collection.content ? (
                    <BlocksRenderer content={collection.content as BlocksContent} />
                ) : null
            }
            backTo="/collections"
        />
    );
}
