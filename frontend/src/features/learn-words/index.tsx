import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { StyledButton, StyledWordIcon } from './styled-components'

export const LearnWordsButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectedFolderId } = useFoldersStore();
    const { cards } = useCardsStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [initialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleStartLearning = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}/study?initialSide=${initialSide}`);
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

