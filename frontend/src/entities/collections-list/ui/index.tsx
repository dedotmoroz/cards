import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import {
    StyledWrapper,
    StyledTitle,
    StyledList,
    StyledListItem,
    StyledLink,
    StyledCover,
} from './styled-components';
import { ButtonLink } from '@/shared/ui/button-link';

export interface CollectionsListLayoutProps {
    title: string;
    /** Путь для кнопки «Назад». Если не задан — переход на главную для текущего языка */
    backTo?: string;
    children: ReactNode;
}

export const CollectionsListLayout = ({ title, backTo, children }: CollectionsListLayoutProps) => {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const defaultBackPath = i18n.language === 'en' ? '/' : `/${i18n.language}`;
    const backPath = backTo ?? defaultBackPath;

    return (
        <StyledWrapper>
            <ButtonLink startIcon={<ArrowBack />} onClick={() => navigate(backPath)}>
                {t('forms.back')}
            </ButtonLink>
            <StyledTitle>{title}</StyledTitle>
            {children}
        </StyledWrapper>
    );
};

export { StyledList, StyledListItem, StyledLink, StyledCover };
