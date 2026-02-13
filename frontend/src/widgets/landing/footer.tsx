import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { getPages } from '@/shared/api/pagesApi';
import { StyledFooter, StyledFooterLinks } from './styled-components.ts';

type PageItem = { slug: string; title: string; locale?: string };

export const Footer = () => {
    const { i18n } = useTranslation();
    const locale = i18n.language || 'en';
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPages(locale)
            .then((data: PageItem[]) => setPages(Array.isArray(data) ? data : []))
            .catch(() => setPages([]))
            .finally(() => setLoading(false));
    }, [locale]);

    return (
        <StyledFooter>
            {!loading && pages.length > 0 && (
                <StyledFooterLinks>
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
