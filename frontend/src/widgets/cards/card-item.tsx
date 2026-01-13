import { Typography } from "@mui/material";
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
    StyledCardSentencesText,
    StyledMargin,
    StyledBoxAnswer,
    StyledBoxQuestion,
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
                    <StyledCardColumn
                        $isVisible={displayFilter === 'A' || displayFilter === 'AB' || expandedCardId === card.id}
                    >
                        <StyledBoxQuestion>
                            <StyledCardText
                                variant="body1"
                                color="text.primary"
                            >
                                {card.question}
                            </StyledCardText>
                        </StyledBoxQuestion>
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
                    <StyledCardColumn
                        $isVisible={displayFilter === 'B' || displayFilter === 'AB' || expandedCardId === card.id}
                    >
                        <StyledBoxAnswer>
                            <StyledCardText
                                variant="body1"
                                color="text.primary"
                            >
                                {card.answer}
                            </StyledCardText>
                        </StyledBoxAnswer>
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
                    {onReload && (
                        <StyledMargin>
                            <GenerateAiSentencesButton
                                cardId={card.id}
                                generationStatus={generationStatus}
                                onGenerate={onReload}
                            />
                        </StyledMargin>
                    )}
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