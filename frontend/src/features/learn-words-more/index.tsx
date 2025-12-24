import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { useState } from 'react';

export const LearnWordsMoreButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectedFolderId } = useFoldersStore();
    const { cards } = useCardsStore();

    const [initialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleStartLearningUnlearned = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}/study?mode=unlearned&initialSide=${initialSide}`);
        }
    };

    return (
        <Button
            onClick={handleStartLearningUnlearned}
            variant="contained"
            color="secondary"
            disabled={!selectedFolderId || cards.length === 0}
            sx={{ borderRadius: 8 }}
        >
            {t('learning.wantToContinue')}
        </Button>
    );
};

