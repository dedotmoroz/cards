import React, { useState } from 'react';
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
                <Typography variant="h6">Все карточки выучены 🎉</Typography>
                <Button onClick={onExit} sx={{ mt: 2 }}>
                    Назад
                </Button>
            </Box>
        );
    }

    if (cycleCompleted) {
        return (
            <Box textAlign="center">
                <Typography variant="h6">Вы прошли все карточки!</Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button onClick={onExit}>Назад</Button>
                    <Button variant="contained" onClick={handleRestart}>
                        Хочу продолжить
                    </Button>
                </Stack>
            </Box>
        );
    }

    const current = unlearnedCards[index];

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Вопрос:</Typography>
                <Typography>{current.question}</Typography>

                {showAnswer && (
                    <>
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Ответ:
                        </Typography>
                        <Typography>{current.answer}</Typography>
                    </>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    {!showAnswer && (
                        <Button variant="outlined" onClick={() => setShowAnswer(true)}>
                            Показать ответ
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
                            Выучено
                        </Button>
                    )}
                    <Button onClick={onExit}>Назад</Button>
                </Stack>
            </CardContent>
        </Card>
    );
};