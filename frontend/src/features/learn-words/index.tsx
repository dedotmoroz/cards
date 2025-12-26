import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { useAuthStore } from '@/shared/store/authStore';
import { StyledButton, StyledWordIcon } from './styled-components'

export const LearnWordsButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const { selectedFolderId } = useFoldersStore();
    const { cards } = useCardsStore();
    const { user } = useAuthStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const currentUserId = userId || user?.id;

    const [initialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleStartLearning = () => {
        if (selectedFolderId) {
            if (currentUserId) {
                navigate(`/learn/${currentUserId}/${selectedFolderId}/study?initialSide=${initialSide}`);
            } else {
                navigate(`/learn/${selectedFolderId}/study?initialSide=${initialSide}`);
            }
        }
    };

    return (
        <StyledButton
            onClick={handleStartLearning}
            variant="contained"
            disabled={!selectedFolderId || cards.length === 0}
            startIcon={<StyledWordIcon />}
        >
            <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {t('buttons.learnWords')}
            </span>
        </StyledButton>
    );
};

