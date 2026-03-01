import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPage } from "@/shared/api/pagesApi";
import { useSEO } from "@/shared/hooks/useSEO";
import { SITE_BASE_URL } from "@/shared/config/api";
import { PageLayout } from '@/entities';
import { PageLoader } from '@/shared/ui';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';

export default function Page() {
    const { locale, slug } = useParams<{ locale: string; slug: string }>();

    const [page, setPage] = useState<{
        title: string;
        slug: string;
        content: unknown;
        seoTitle?: string | null;
        seoDescription?: string | null;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!locale || !slug) return;

        getPage(locale, slug)
            .then(setPage)
            .finally(() => setLoading(false));
    }, [locale, slug]);

    useSEO({
        title: page ? (page.seoTitle ?? page.title) : undefined,
        description: page?.seoDescription ?? undefined,
        canonical: locale && slug ? `${SITE_BASE_URL}/p/${locale}/${slug}` : undefined,
        lang: locale ?? undefined,
    });

    if (loading) return <PageLoader />;
    if (!page) return <div>Page not found</div>;

    return (
        <PageLayout
            title={page.title}
            content={<BlocksRenderer content={page.content as BlocksContent} />}
        />
    );
}