import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { useState } from 'react';

export const LearnWordsButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectedFolderId } = useFoldersStore();
    const { cards } = useCardsStore();

    const [initialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleStartLearning = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?initialSide=${initialSide}`);
        }
    };

    return (
        <Button
            onClick={handleStartLearning}
            variant="contained"
            disabled={!selectedFolderId || cards.length === 0}
            sx={{ borderRadius: 8 }}
        >
            {t('buttons.learnWords')}
        </Button>
    );
};

