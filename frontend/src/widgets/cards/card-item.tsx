import { Box, Checkbox, IconButton, ListItem, Typography } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { Card } from "@/shared/types/cards";

interface CardItemProps {
    card: Card;
    handleCardClick: (cardId: string) => void;
    displayFilter: 'A' | 'AB' | 'B';
    expandedCardId: string | null;
    updateCardLearnStatus: (cardId: string, isLearned: boolean) => void;
    handleMenuOpen: (event: React.MouseEvent<HTMLElement>, cardId: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
                             card,
                             handleCardClick,
                             displayFilter,
                             expandedCardId,
                             updateCardLearnStatus,
                             handleMenuOpen,
                         }) => {

    return (
        <ListItem
            key={card.id}
            divider
            onClick={() => handleCardClick(card.id)}
            sx={{
                '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                },
                transition: 'background-color 0.2s ease-in-out'
            }}
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
                    </Box>
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