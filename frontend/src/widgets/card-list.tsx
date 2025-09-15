import React from 'react';
import { Checkbox, List, ListItem, ListItemText, Box } from '@mui/material';

type Card = {
  id: string;
  question: string;
  answer: string;
  isLearned: boolean;
};

type CardListProps = {
  cards: Card[];
  onToggleLearned?: (id: string) => void;
};

export const CardList: React.FC<CardListProps> = ({
                                                    cards,
                                                     // onToggleLearned
}) => {
  return (
      <List>
        {cards.length && cards.map((card) => (
            <ListItem key={card.id} divider>
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <ListItemText
                    primary={card.question}
                    secondary={card.answer}
                />
                <Checkbox
                    edge="end"
                    checked={card.isLearned}
                    // onChange={() => onToggleLearned(card.id)}
                />
              </Box>
            </ListItem>
        ))}
      </List>
  );
};
