import { Box, IconButton, ListItem, Typography, Skeleton } from "@mui/material";
import { CheckboxUI } from '@/shared/ui/checkbox-ui';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { Card } from "@/shared/types/cards";
import type { CardGenerationState } from "@/shared/store/cardsStore";
import { GenerateAiSentencesButton } from '@/features/generate-ai-sentences';
import styled from './style.module.css'

interface CardItemProps {
    card: Card;
    handleCardClick: (cardId: string) => void;
    displayFilter: 'A' | 'AB' | 'B';
    expandedCardId: string | null;
    updateCardLearnStatus: (cardId: string, isLearned: boolean) => void;
    handleMenuOpen: (event: React.MouseEvent<HTMLElement>, cardId: string) => void;
    onReload?: (cardId: string) => void;
    generationStatus?: CardGenerationState;
}

export const CardItem: React.FC<CardItemProps> = ({
                             card,
                             handleCardClick,
                             displayFilter,
                             expandedCardId,
                             updateCardLearnStatus,
                             handleMenuOpen,
                             onReload,
                             generationStatus,
                         }) => {

    const state = generationStatus ?? { status: 'idle', progress: 0 };
    const isGenerating = state.status === 'pending' || state.status === 'polling';
    const hasError = state.status === 'failed' && state.error;

    return (
        <ListItem
            key={card.id}
            divider
            onClick={() => handleCardClick(card.id)}
            className={styled.listItem}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Box display="flex" width="100%" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box flex={1}>
                        <Typography
                            variant="body1"
                            color="text.primary"
                            sx={{
                                fontSize: 20,
                                visibility: (displayFilter === 'A' || displayFilter === 'AB' || expandedCardId === card.id) ? 'visible' : 'hidden'
                            }}
                        >
                            {card.question}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>

                            {isGenerating ? (
                                <Box flex={1} sx={{ mt: 1 }}>
                                    <Skeleton variant="text" width="100%" height={20} />
                                    <Skeleton variant="text" width="80%" height={20} />
                                </Box>
                            ) : (
                                card.questionSentences && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                                    >
                                        {card.questionSentences}
                                    </Typography>
                                )
                            )}
                            {onReload && (
                                <GenerateAiSentencesButton
                                    cardId={card.id}
                                    generationStatus={generationStatus}
                                    onGenerate={onReload}
                                />
                            )}
                        </Box>
                    </Box>
                    <Box flex={1}>
                        <Typography
                            variant="body1"
                            color="text.primary"
                            sx={{
                                fontSize: 20,
                                visibility: (displayFilter === 'B' || displayFilter === 'AB' || expandedCardId === card.id) ? 'visible' : 'hidden'
                            }}
                        >
                            {card.answer}
                        </Typography>
                        {isGenerating ? (
                            <Box sx={{ mt: 1 }}>
                                <Skeleton variant="text" width="100%" height={20} />
                                <Skeleton variant="text" width="80%" height={20} />
                            </Box>
                        ) : (
                            card.answerSentences && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                                >
                                    {card.answerSentences}
                                </Typography>
                            )
                        )}
                    </Box>
                    {hasError && (
                        <Typography variant="caption" color="error.main" mt={1}>
                            {state.error}
                        </Typography>
                    )}
                </Box>
                <Box display="flex" width={'80px'} alignItems="center" gap={2} sx={{ml: 2}}>
                    <CheckboxUI
                        edge="end"
                        checked={card.isLearned}
                        onChange={(e) => updateCardLearnStatus(card.id, e.target.checked)}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, card.id)}>
                        <MoreHorizIcon/>
                    </IconButton>
                </Box>
            </Box>
        </ListItem>
    )
}