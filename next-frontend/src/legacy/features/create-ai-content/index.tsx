import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFoldersStore } from '@/shared/store/foldersStore.ts';
import { useAuthStore } from '@/shared/store/authStore.ts';
import { ButtonBlack } from '@/shared/ui/button-black';
import { StyledAiContentIcon } from './styled-components';

export const CreateAiContentButton = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { userId, folderId: folderIdFromUrl } = useParams<{ userId?: string; folderId?: string }>();
    const { user } = useAuthStore();
    const { selectedFolderId } = useFoldersStore();

    const handleGoToContent = () => {
        const currentFolderId = folderIdFromUrl || selectedFolderId;
        const currentUserIdForNav = userId || user?.id;
        if (!currentFolderId || !currentUserIdForNav) return;
        navigate(`/learn/${currentUserIdForNav}/${currentFolderId}/context-reading`);
    };

    return (
        <ButtonBlack
            onClick={handleGoToContent}
            disabled={!selectedFolderId}
            startIcon={<StyledAiContentIcon />}
        >
            <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {t('cards.context')}
            </span>
        </ButtonBlack>
    );
};
