import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { useState } from 'react';

export const LearnPhrasesButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectedFolderId } = useFoldersStore();
    const { cards } = useCardsStore();

    const [initialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleStartLearningPhrases = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?mode=phrases&initialSide=${initialSide}`);
        }
    };

    const hasCardsWithPhrases = cards.some(
        card => card.questionSentences && card.answerSentences
    );

    return (
        <Button
            onClick={handleStartLearningPhrases}
            variant="contained"
            disabled={!selectedFolderId || cards.length === 0 || !hasCardsWithPhrases}
            sx={{ borderRadius: 8 }}
        >
            {t('buttons.learnPhrases')}
        </Button>
    );
};

