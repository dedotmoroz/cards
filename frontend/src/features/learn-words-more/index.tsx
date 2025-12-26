import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useCardsStore } from '@/shared/store/cardsStore';
import { useAuthStore } from '@/shared/store/authStore';
import { useState } from 'react';

export const LearnWordsMoreButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const { selectedFolderId } = useFoldersStore();
    const { cards } = useCardsStore();
    const { user } = useAuthStore();
    const currentUserId = userId || user?.id;

    const [initialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleStartLearningUnlearned = () => {
        if (selectedFolderId) {
            if (currentUserId) {
                navigate(`/learn/${currentUserId}/${selectedFolderId}/study?mode=unlearned&initialSide=${initialSide}`);
            } else {
                navigate(`/learn/${selectedFolderId}/study?mode=unlearned&initialSide=${initialSide}`);
            }
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

