import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPage } from "@/shared/api/pagesApi";
import { useSEO } from "@/shared/hooks/useSEO";
import { SITE_BASE_URL } from "@/shared/config/api";
import { PageLayout } from '@/entities';
import { HeaderCollection, PageLoader } from '@/shared/ui';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { Box } from '@mui/material';
import { Footer } from '@/widgets/landing/footer.tsx';

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
                    title={page.title}
                    content={<BlocksRenderer content={page.content as BlocksContent} />}
                />
            </Box>
            <Box sx={{ mt: 'auto', pt: 5 }}>
                <Footer />
            </Box>
        </Box>
    );
}