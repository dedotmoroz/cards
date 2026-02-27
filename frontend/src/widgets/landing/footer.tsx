import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { getPages } from '@/shared/api/pagesApi';
import { getCollections, type CollectionListItem } from '@/shared/api/collectionsApi';
import { StyledFooter, StyledFooterLinks } from './styled-components.ts';

type PageItem = { slug: string; title: string; locale?: string };

export const Footer = () => {
    const { i18n, t } = useTranslation();
    const locale = i18n.language || 'en';
    const [pages, setPages] = useState<PageItem[]>([]);
    const [collections, setCollections] = useState<CollectionListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [pagesData, collectionsData] = await Promise.all([
                    getPages(locale),
                    getCollections(locale),
                ]);
                setPages(Array.isArray(pagesData) ? pagesData : []);
                setCollections(Array.isArray(collectionsData) ? collectionsData : []);
            } catch {
                setPages([]);
                setCollections([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [locale]);

    return (
        <StyledFooter>
            {!loading && (
                <StyledFooterLinks>
                    {collections.length > 0 && (
                        <Link to="/collections">
                            <Typography component="span" variant="body2">
                                {t('footer.vocabularyCollections')}
                            </Typography>
                        </Link>
                    )}
                    {pages.map((page) => (
                        <Link key={page.slug} to={`/p/${locale}/${page.slug}`}>
                            <Typography component="span" variant="body2">
                                {page.title}
                            </Typography>
                        </Link>
                    ))}
                </StyledFooterLinks>
            )}
        </StyledFooter>
    );
};
