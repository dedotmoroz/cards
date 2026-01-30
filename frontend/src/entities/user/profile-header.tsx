import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { ButtonLink } from '@/shared/ui/button-link';
import { StyledNavigationBox, StyledNavigationInner } from './styled-components';

interface ProfileHeaderProps {
    navigateTo?: string;
}

export const ProfileHeader = ({ navigateTo }: ProfileHeaderProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClick = () => {
        if (navigateTo !== undefined) {
            navigate(navigateTo);
        } else {
            navigate(-1);
        }
    };

    return (
        <StyledNavigationBox>
            <StyledNavigationInner>
                <ButtonLink
                    startIcon={<ArrowBack />}
                    onClick={handleClick}
                >
                    {t('forms.back')}
                </ButtonLink>
            </StyledNavigationInner>
        </StyledNavigationBox>
    );
};
