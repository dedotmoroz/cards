import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { ButtonLink } from '@/shared/ui/button-link';
import { StyledNavigationBox, StyledNavigationInner } from './styled-components';

export const ProfileHeader = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <StyledNavigationBox>
            <StyledNavigationInner>
                <ButtonLink
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                >
                    {t('forms.back')}
                </ButtonLink>
            </StyledNavigationInner>
        </StyledNavigationBox>
    );
};
