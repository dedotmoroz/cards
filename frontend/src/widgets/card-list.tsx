import React, { useState } from 'react';
import { Checkbox, List, ListItem, ListItemText, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useCardsStore } from '@/shared/store/cardsStore';

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
  const { updateCardApi, updateCardLearnStatus, deleteCard } = useCardsStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameQuestion, setRenameQuestion] = useState('');
  const [renameAnswer, setRenameAnswer] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedCardId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCardId(null);
  };

  const handleRename = () => {
    if (!selectedCardId) return;
    const card = cards.find(c => c.id === selectedCardId);
    if (!card) return handleMenuClose();
    setEditingCardId(selectedCardId);
    setRenameQuestion(card.question);
    setRenameAnswer(card.answer);
    setRenameOpen(true);
    handleMenuClose();
  };

  const handleRenameCancel = () => {
    setRenameOpen(false);
    setEditingCardId(null);
  };

  const handleRenameSave = async () => {
    if (!editingCardId) return;
    const q = renameQuestion.trim();
    const a = renameAnswer.trim();
    if (!q || !a) {
      setRenameOpen(false);
      setEditingCardId(null);
      return;
    }
    try {
      await updateCardApi(editingCardId, { question: q, answer: a });
      setRenameOpen(false);
      setEditingCardId(null);
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCardId) return;
    const card = cards.find(c => c.id === selectedCardId);
    if (card && confirm(`Удалить карточку «${card.question}»?`)) {
      await deleteCard(selectedCardId);
    }
    handleMenuClose();
  };

  return (
      <>
        <List>
          {cards.length && cards.map((card) => (
              <ListItem key={card.id} divider>
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <ListItemText
                      primary={card.question}
                      secondary={card.answer}
                  />
                  <Box display="flex" alignItems="center" gap={1}>
                    <Checkbox
                        edge="end"
                        checked={card.isLearned}
                        onChange={(e) => updateCardLearnStatus(card.id, e.target.checked)}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, card.id)}>
                      <MoreHorizIcon />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
          ))}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleRename}>Переименовать</MenuItem>
            <MenuItem onClick={handleDelete}>Удалить</MenuItem>
          </Menu>
        </List>

        <Dialog open={renameOpen} onClose={handleRenameCancel} fullWidth>
          <DialogTitle>Редактировать карточку</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Вопрос"
              fullWidth
              value={renameQuestion}
              onChange={(e) => setRenameQuestion(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Ответ"
              fullWidth
              value={renameAnswer}
              onChange={(e) => setRenameAnswer(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRenameCancel}>Отмена</Button>
            <Button onClick={handleRenameSave} variant="contained">Сохранить</Button>
          </DialogActions>
        </Dialog>
      </>
  );
};
