import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { useAuthStore } from '@/shared/store/authStore';
import { StyledRestartButton, StyledReplayIcon } from './styled-components';

export const RestartLearningButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const { selectedFolderId } = useFoldersStore();
    const { cards, updateFolderLearnStatus } = useCardsStore();
    const { user } = useAuthStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const currentUserId = userId || user?.id;
    const [isResetting, setIsResetting] = useState(false);

    const [initialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const isInProgress = useMemo(() => {
        const hasLearned = cards.some((card) => card.isLearned);
        const hasUnlearned = cards.some((card) => !card.isLearned);
        return hasLearned && hasUnlearned;
    }, [cards]);

    const isVirtualFolder = Boolean(selectedFolderId?.startsWith('virtual:'));

    const handleRestart = async () => {
        if (!selectedFolderId || isVirtualFolder || isResetting) return;

        setIsResetting(true);
        try {
            await updateFolderLearnStatus(selectedFolderId, false);

            const query = `initialSide=${initialSide}`;
            if (currentUserId) {
                navigate(`/learn/${currentUserId}/${selectedFolderId}/study?${query}`);
            } else {
                navigate(`/learn/${selectedFolderId}/study?${query}`);
            }
        } finally {
            setIsResetting(false);
        }
    };

    if (!isInProgress || isVirtualFolder) {
        return null;
    }

    return (
        <StyledRestartButton
            onClick={handleRestart}
            variant="contained"
            disabled={!selectedFolderId || cards.length === 0 || isResetting}
            startIcon={<StyledReplayIcon />}
        >
            <span style={{ display: isMobile ? 'none' : 'inline'}}>
                {/*{t('learning.restart')}*/}
            </span>
        </StyledRestartButton>
    );
};
