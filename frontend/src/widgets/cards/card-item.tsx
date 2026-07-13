import { Typography } from "@mui/material";
import type { Card, CardGenerationRequest } from "@/shared/types/cards";
import { getCardContexts } from "@/shared/types/cards";
import type { CardGenerationState } from "@/shared/store/cardsStore";
import { GenerateAiSentencesButton } from '@/features/generate-ai-sentences';
import { ToggleCardLearned } from '@/features/toggle-card-learned';
import { CardMenuButton } from '@/features/card-menu-button';
import { PronunciationButton } from '@/features/pronunciation-button';
import { CardSkeleton } from "@/entities/cards";
import { ContextCarousel } from '@/features/context-carousel';
import {
    StyledListItem,
    StyledCardContainer,
    StyledCardContent,
    StyledCardColumn,
    StyledCardColumnContent,
    StyledHiddenColumnOverlay,
    StyledHiddenEyeIcon,
    StyledCardActions,
    StyledSentencesContainer,
    StyledCardText,
    StyledMargin,
    StyledBoxAnswer,
    StyledBoxQuestion,
} from './styled-components.ts';

interface CardItemProps {
    card: Card;
    handleCardClick: (cardId: string) => void;
    displayFilter: 'A' | 'AB' | 'B';
    expandedCardId: string | null;
    highlighted?: boolean;
    updateCardLearnStatus: (cardId: string, isLearned: boolean) => void;
    handleMenuOpen: (event: React.MouseEvent<HTMLElement>, cardId: string) => void;
    onReload?: (cardId: string, options?: CardGenerationRequest) => void;
    onSelectContext?: (cardId: string, contextId: string) => void;
    generationStatus?: CardGenerationState;
}

export const CardItem: React.FC<CardItemProps> = ({
                             card,
                             handleCardClick,
                             displayFilter,
                             expandedCardId,
                             highlighted = false,
                             updateCardLearnStatus,
                             handleMenuOpen,
                             onReload,
                             onSelectContext,
                             generationStatus,
                         }) => {
    
    const state = generationStatus ?? { status: 'idle', progress: 0 };
    const isGenerating = state.status === 'pending' || state.status === 'polling';
    const hasError = state.status === 'failed' && state.error;
    const isQuestionVisible = displayFilter === 'A' || displayFilter === 'AB' || expandedCardId === card.id;
    const isAnswerVisible = displayFilter === 'B' || displayFilter === 'AB' || expandedCardId === card.id;
    const contexts = getCardContexts(card);

    const handleSelectContext = (contextId: string) => {
        onSelectContext?.(card.id, contextId);
    };

    return (
        <StyledListItem
            key={card.id}
            data-card-id={card.id}
            $highlighted={highlighted}
            onClick={() => handleCardClick(card.id)}
        >
            <StyledCardContainer>
                <StyledCardContent>
                    <StyledCardColumn>
                        <StyledCardColumnContent $isVisible={isQuestionVisible}>
                            <StyledBoxQuestion>
                                <StyledCardText
                                    variant="body1"
                                    color="text.primary"
                                >
                                    {card.question}
                                </StyledCardText>
                                <PronunciationButton text={card.question} lang={'en'} />
                            </StyledBoxQuestion>
                            <StyledSentencesContainer>
                                {isGenerating ? (
                                    <CardSkeleton />
                                ) : (
                                    contexts.length > 0 && (
                                        <ContextCarousel
                                            contexts={contexts}
                                            activeContextId={card.activeContextId}
                                            side="text"
                                            onSelect={handleSelectContext}
                                        />
                                    )
                                )}
                            </StyledSentencesContainer>
                        </StyledCardColumnContent>
                        {!isQuestionVisible && (
                            <StyledHiddenColumnOverlay>
                                <StyledHiddenEyeIcon />
                            </StyledHiddenColumnOverlay>
                        )}
                    </StyledCardColumn>
                    <StyledCardColumn>
                        <StyledCardColumnContent $isVisible={isAnswerVisible}>
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
                                contexts.length > 0 && (
                                    <ContextCarousel
                                        contexts={contexts}
                                        activeContextId={card.activeContextId}
                                        side="translation"
                                        onSelect={handleSelectContext}
                                    />
                                )
                            )}
                        </StyledCardColumnContent>
                        {!isAnswerVisible && (
                            <StyledHiddenColumnOverlay>
                                <StyledHiddenEyeIcon />
                            </StyledHiddenColumnOverlay>
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
                                contextCount={contexts.length}
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
