import { Box, Button, Checkbox, CircularProgress, IconButton, ListItem, Typography } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ReplayIcon from "@mui/icons-material/Replay";
import type { Card } from "@/shared/types/cards";
import type { CardGenerationState } from "@/shared/store/cardsStore";
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
                        {card.questionSentences && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                            >
                                {card.questionSentences}
                            </Typography>
                        )}
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
                        {card.answerSentences && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                            >
                                {card.answerSentences}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="text"
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            onReload?.(card.id);
                        }}
                        disabled={isGenerating}
                        sx={{
                            minWidth: 0,
                            padding: 0.5,
                            alignSelf: 'flex-start',
                            color: 'text.secondary'
                        }}
                    >
                        {isGenerating
                            ? (<CircularProgress size={16} />)
                            : (<ReplayIcon fontSize="small" />)
                        }
                    </Button>

                    {hasError && (
                        <Typography variant="caption" color="error.main" mt={1}>
                            {state.error}
                        </Typography>
                    )}

                </Box>
                <Box display="flex" width={'80px'} alignItems="center" gap={2} sx={{ml: 2}}>
                    <Checkbox
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