import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { useAuthStore } from '@/shared/store/authStore';
import { StyledButton, StyledPlayIcon, StyledPlayPauseIcon } from './styled-components';

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

    const isInProgress = useMemo(() => {
        const hasLearned = cards.some((card) => card.isLearned);
        const hasUnlearned = cards.some((card) => !card.isLearned);
        return hasLearned && hasUnlearned;
    }, [cards]);

    const handleStartLearning = () => {
        if (!selectedFolderId) return;

        const modeQuery = isInProgress ? 'mode=unlearned&' : '';
        const query = `${modeQuery}initialSide=${initialSide}`;

        if (currentUserId) {
            if (selectedFolderId.startsWith('virtual:')) {
                const kind = selectedFolderId.replace(/^virtual:/, '');
                navigate(`/learn/${currentUserId}/virtual/${kind}/study?${query}`);
            } else {
                navigate(`/learn/${currentUserId}/${selectedFolderId}/study?${query}`);
            }
            return;
        }

        navigate(`/learn/${selectedFolderId}/study?${query}`);
    };

    return (
        <StyledButton
            onClick={handleStartLearning}
            variant="contained"
            disabled={!selectedFolderId || cards.length === 0}
            startIcon={isInProgress ? <StyledPlayPauseIcon /> : <StyledPlayIcon />}
        >
            <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {isInProgress ? t('learning.wantToContinue') : t('buttons.learnWords')}
            </span>
        </StyledButton>
    );
};
