import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List, Box, Typography, IconButton, Checkbox } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useCardsStore } from '@/shared/store/cardsStore.ts';
import {MenuCard} from "@/widgets/cards/menu-card.tsx";
import {DialogCard} from "@/widgets/cards/dialog-card.tsx";
import {CardItem} from "@/widgets/cards/card-item.tsx";

type Card = {
  id: string;
  question: string;
  answer: string;
  isLearned: boolean;
};

type CardListProps = {
  cards: Card[];
  onToggleLearned?: (id: string) => void;
  displayFilter?: 'A' | 'AB' | 'B';
  showOnlyUnlearned?: boolean;
  onFilterChange?: (filter: 'A' | 'AB' | 'B') => void;
  selectAll?: boolean;
  onSelectAllChange?: (checked: boolean) => void;
};

export const CardList: React.FC<CardListProps> = ({
                                                    cards,
                                                    displayFilter = 'AB',
                                                    showOnlyUnlearned = false,
                                                    onFilterChange,
                                                    selectAll = false,
                                                    onSelectAllChange,
                                                     // onToggleLearned
}) => {
  const { t } = useTranslation();
  const { updateCardApi, updateCardLearnStatus, deleteCard } = useCardsStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameQuestion, setRenameQuestion] = useState('');
  const [renameAnswer, setRenameAnswer] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

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
    if (card && confirm(`${t('cards.delete')} «${card.question}»?`)) {
      await deleteCard(selectedCardId);
    }
    handleMenuClose();
  };

  const handleCardClick = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  // Фильтрация карточек по выученности
  const filteredCards = showOnlyUnlearned 
    ? cards.filter(card => !card.isLearned)
    : cards;

  const handleQuestionToggle = () => {
    console.log('Question toggle clicked, current filter:', displayFilter);
    if (onFilterChange) {
      // Переключаем видимость вопроса
      if (displayFilter === 'A' || displayFilter === 'AB') {
        // Сейчас вопрос виден, скрываем его
        onFilterChange('B');
      } else {
        // Сейчас вопрос скрыт, показываем его
        onFilterChange(displayFilter === 'B' ? 'AB' : 'A');
      }
    } else {
      console.log('onFilterChange is not provided');
    }
  };

  const handleAnswerToggle = () => {
    console.log('Answer toggle clicked, current filter:', displayFilter);
    if (onFilterChange) {
      // Переключаем видимость ответа
      if (displayFilter === 'B' || displayFilter === 'AB') {
        // Сейчас ответ виден, скрываем его
        onFilterChange('A');
      } else {
        // Сейчас ответ скрыт, показываем его
        onFilterChange(displayFilter === 'A' ? 'AB' : 'B');
      }
    } else {
      console.log('onFilterChange is not provided');
    }
  };

  return (
      <>
        {/* Заголовки колонок */}
        <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1} bgcolor="grey.50" borderBottom={1} borderColor="grey.200">
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t('forms.question')}
            </Typography>
            <IconButton size="small" onClick={handleQuestionToggle}>
              {displayFilter === 'A' || displayFilter === 'AB' ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Box>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t('forms.answer')}
            </Typography>
            <IconButton size="small" onClick={handleAnswerToggle}>
              {displayFilter === 'B' || displayFilter === 'AB' ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              checked={selectAll}
              onChange={(e) => onSelectAllChange?.(e.target.checked)}
              size="small"
              sx={{ 
                visibility: 'visible',
                opacity: 1,
                color: 'primary.main'
              }}
            />
          </Box>
        </Box>
        
        <List>
          {filteredCards.length && filteredCards.map((card) => (
              <CardItem
                  card={card}
                  handleCardClick={handleCardClick}
                  displayFilter={displayFilter}
                  expandedCardId={expandedCardId}
                  updateCardLearnStatus={updateCardLearnStatus}
                  handleMenuOpen={handleMenuOpen}
              />
          ))}
          <MenuCard
              handleMenuClose={handleMenuClose}
              handleDelete={handleDelete}
              anchorEl={anchorEl}
              handleRename={handleRename}
          />
        </List>
        <DialogCard
            renameOpen={renameOpen}
            handleRenameCancel={handleRenameCancel}
            renameQuestion={renameQuestion}
            setRenameQuestion={setRenameQuestion}
            renameAnswer={renameAnswer}
            setRenameAnswer={setRenameAnswer}
            handleRenameSave={handleRenameSave}
        />
      </>
  );
};
