import { Box, Typography } from "@mui/material";
import type { Card } from "@/shared/types/cards";
import type { CardGenerationState } from "@/shared/store/cardsStore";
import { GenerateAiSentencesButton } from '@/features/generate-ai-sentences';
import { ToggleCardLearned } from '@/features/toggle-card-learned';
import { CardMenuButton } from '@/features/card-menu-button';
import { CardSkeleton } from "@/entities/cards";
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
            onClick={() => handleCardClick(card.id)}
        >
            <StyledCardContainer>
                <StyledCardContent>
                    <StyledCardColumn>
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                            <StyledCardText
                                variant="body1"
                                color="text.primary"
                                $isVisible={displayFilter === 'A' || displayFilter === 'AB' || expandedCardId === card.id}
                            >
                                {card.question}
                            </StyledCardText>
                            {onReload && (
                                <GenerateAiSentencesButton
                                    cardId={card.id}
                                    generationStatus={generationStatus}
                                    onGenerate={onReload}
                                />
                            )}
                        </Box>
                        <StyledSentencesContainer>
                            {isGenerating ? (
                                <CardSkeleton />
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
                            <CardSkeleton />
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
                    <CardMenuButton
                        cardId={card.id}
                        onMenuOpen={handleMenuOpen}
                    />
                </StyledCardActions>
            </StyledCardContainer>
        </StyledListItem>
    )
}