import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import { useCardsStore } from '@/shared/store/cardsStore';

type CardType = {
    id: string;
    question: string;
    answer: string;
    isLearned: boolean;
};

type LearnSectionProps = {
    cards: CardType[];
    onMarkAsLearned?: (id: string) => void;
    onExit: () => void;
};

export const LearnSection: React.FC<LearnSectionProps> = ({
                                                              cards,
                                                              onMarkAsLearned = () => {},
                                                              onExit,
                                                          }) => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [cycleCompleted, setCycleCompleted] = useState(false);
    const { updateCardLearnStatus } = useCardsStore();

    const unlearnedCards = cards.filter((card) => !card.isLearned);

    const handleNext = () => {
        if (index + 1 < unlearnedCards.length) {
            setIndex(index + 1);
            setShowAnswer(false);
        } else {
            setCycleCompleted(true);
        }
    };

    const handleRestart = () => {
        setIndex(0);
        setShowAnswer(false);
        setCycleCompleted(false);
    };

    if (unlearnedCards.length === 0) {
        return (
            <Box textAlign="center">
                <Typography variant="h6">{t('learning.allLearned')}</Typography>
                <Button onClick={onExit} sx={{ mt: 2 }}>
                    {t('forms.back')}
                </Button>
            </Box>
        );
    }

    if (cycleCompleted) {
        return (
            <Box textAlign="center">
                <Typography variant="h6">{t('learning.completedCycle')}</Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button onClick={onExit}>{t('forms.back')}</Button>
                    <Button variant="contained" onClick={handleRestart}>
                        {t('learning.wantToContinue')}
                    </Button>
                </Stack>
            </Box>
        );
    }

    const current = unlearnedCards[index];

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{t('forms.question')}:</Typography>
                <Typography>{current.question}</Typography>

                {showAnswer && (
                    <>
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            {t('forms.answer')}:
                        </Typography>
                        <Typography>{current.answer}</Typography>
                    </>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    {!showAnswer && (
                        <Button variant="outlined" onClick={() => setShowAnswer(true)}>
                            {t('learning.showAnswer')}
                        </Button>
                    )}
                    {showAnswer && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={async () => {
                                await updateCardLearnStatus(current.id, true);
                                onMarkAsLearned(current.id);
                                handleNext();
                            }}
                        >
                            {t('learning.learned')}
                        </Button>
                    )}
                    <Button onClick={onExit}>{t('forms.back')}</Button>
                </Stack>
            </CardContent>
        </Card>
    );
};