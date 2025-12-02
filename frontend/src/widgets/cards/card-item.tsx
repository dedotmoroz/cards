import { Box, IconButton, Typography, Skeleton } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { Card } from "@/shared/types/cards";
import type { CardGenerationState } from "@/shared/store/cardsStore";
import { GenerateAiSentencesButton } from '@/features/generate-ai-sentences';
import { ToggleCardLearned } from '@/features/toggle-card-learned';
import {
    StyledListItem,
    StyledCardContainer,
    StyledCardContent,
    StyledCardColumn,
    StyledCardActions,
    StyledSentencesContainer,
    StyledCardText,
    StyledCardSentencesText
} from './styled-components.ts';

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
        <StyledListItem
            key={card.id}
            divider
            onClick={() => handleCardClick(card.id)}
        >
            <StyledCardContainer>
                <StyledCardContent>
                    <StyledCardColumn>
                        <StyledCardText
                            variant="body1"
                            color="text.primary"
                            $isVisible={displayFilter === 'A' || displayFilter === 'AB' || expandedCardId === card.id}
                        >
                            {card.question}
                        </StyledCardText>
                        <StyledSentencesContainer>

                            {isGenerating ? (
                                <Box flex={1} sx={{ mt: 1 }}>
                                    <Skeleton variant="text" width="100%" height={20} />
                                    <Skeleton variant="text" width="80%" height={20} />
                                </Box>
                            ) : (
                                card.questionSentences && (
                                    <StyledCardSentencesText
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {card.questionSentences}
                                    </StyledCardSentencesText>
                                )
                            )}
                            {onReload && (
                                <GenerateAiSentencesButton
                                    cardId={card.id}
                                    generationStatus={generationStatus}
                                    onGenerate={onReload}
                                />
                            )}
                        </StyledSentencesContainer>
                    </StyledCardColumn>
                    <StyledCardColumn>
                        <StyledCardText
                            variant="body1"
                            color="text.primary"
                            $isVisible={displayFilter === 'B' || displayFilter === 'AB' || expandedCardId === card.id}
                        >
                            {card.answer}
                        </StyledCardText>
                        {isGenerating ? (
                            <Box sx={{ mt: 1 }}>
                                <Skeleton variant="text" width="100%" height={20} />
                                <Skeleton variant="text" width="80%" height={20} />
                            </Box>
                        ) : (
                            card.answerSentences && (
                                <StyledCardSentencesText
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {card.answerSentences}
                                </StyledCardSentencesText>
                            )
                        )}
                    </StyledCardColumn>
                    {hasError && (
                        <Typography variant="caption" color="error.main" mt={1}>
                            {state.error}
                        </Typography>
                    )}
                </StyledCardContent>
                <StyledCardActions>
                    <ToggleCardLearned
                        cardId={card.id}
                        isLearned={card.isLearned}
                        onToggle={updateCardLearnStatus}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, card.id)}>
                        <MoreHorizIcon/>
                    </IconButton>
                </StyledCardActions>
            </StyledCardContainer>
        </StyledListItem>
    )
}