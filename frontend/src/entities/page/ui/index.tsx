import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { StyledWrapper, StyledTitle, StyledContent } from './styled-components';
import { ButtonLink } from '@/shared/ui/button-link';

interface IPageLayout {
    title: string;
    content: ReactNode;
    /** Путь для кнопки «Назад». Если не задан — переход на главную для текущего языка */
    backTo?: string;
}

export const PageLayout = ({ title, content, backTo }: IPageLayout) => {
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
            <StyledContent>{content}</StyledContent>
        </StyledWrapper>
    );
};