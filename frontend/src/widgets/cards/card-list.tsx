import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List, IconButton, Box, Typography } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { ToggleShowOnlyUnlearned } from '@/features/toggle-show-only-unlearned';
import { SelectAllCards } from '@/features/select-all-cards';
import { useCardsStore } from '@/shared/store/cardsStore.ts';
// import { GenerateAllAiSentencesButton } from '@/features/generate-all-ai-sentences';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import {MenuCard} from "@/widgets/cards/menu-card.tsx";
import {DialogCard} from "@/widgets/cards/dialog-card.tsx";
import {CardItem} from "@/widgets/cards/card-item.tsx";
import {CreateCardForm} from "@/widgets/cards/create-card-form.tsx";
import type { Card } from "@/shared/types/cards";
import {
    StyledCardBoxHeader,
    StyledBoxWrapper,
    StyledBoxSideA,
    StyledBoxSideB,
    StyledColumnHeader,
    StyledHeaderCardActions,
    StyledCardHeaderContent,
    StyledHeaderWithButton,
    // StyledMargin,
    StyledMarginMobile,
} from './styled-components.ts';

type CardListProps = {
  cards: Card[];
  onToggleLearned?: (id: string) => void;
  displayFilter?: 'A' | 'AB' | 'B';
  showOnlyUnlearned?: boolean;
  onFilterChange?: (filter: 'A' | 'AB' | 'B') => void;
  selectAll?: boolean;
  onSelectAllChange?: (checked: boolean) => void;
  onToggleShowOnlyUnlearned?: () => void;
  isCreatingCard?: boolean;
  folderId?: string;
  onCancelCreateCard?: () => void;
};

export const CardList: React.FC<CardListProps> = ({
                                                    cards,
                                                    displayFilter = 'AB',
                                                    showOnlyUnlearned = false,
                                                    onFilterChange,
                                                    selectAll = false,
                                                    onSelectAllChange,
                                                    onToggleShowOnlyUnlearned,
                                                    isCreatingCard = false,
                                                    folderId,
                                                    onCancelCreateCard,
                                                     // onToggleLearned
}) => {
  const { t } = useTranslation();
  const {
      updateCardApi,
      updateCardLearnStatus,
      deleteCard,
      generateCardSentences,
      createCard,
      // generateAllCardsSentences,
      generationStatuses
  } = useCardsStore();
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

  const handleSaveCard = async (question: string, answer: string) => {
    if (folderId) {
      await createCard(folderId, question, answer);
      onCancelCreateCard?.();
    }
  };

  const handleAutoSaveCard = async (autoSaveFolderId: string, question: string, answer: string) => {
    await createCard(autoSaveFolderId, question, answer);
  };

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

  // const handleGenerateAll = async () => {
  //   await generateAllCardsSentences();
  // };

  // const isAnyGenerating = Object.values(generationStatuses).some(
  //   status => status.status === 'pending' || status.status === 'polling'
  // );

  return (
      <StyledBoxWrapper>
        {/* Заголовки колонок */}
        <StyledCardBoxHeader>
            <StyledCardHeaderContent>
                <StyledBoxSideA>
                    <StyledHeaderWithButton>
                        <StyledColumnHeader variant="subtitle2">
                            {t('forms.question')}
                        </StyledColumnHeader>
                        <IconButton size="small" onClick={handleQuestionToggle}>
                            {displayFilter === 'A' || displayFilter === 'AB'
                                ? <VisibilityOutlined style={{fontSize: '20px'}}/>
                                : <VisibilityOffOutlined style={{fontSize: '20px'}}/>
                            }
                        </IconButton>
                    </StyledHeaderWithButton>
                </StyledBoxSideA>
                <StyledBoxSideB>
                    <StyledHeaderWithButton>
                        <StyledColumnHeader variant="subtitle2">
                            {t('forms.answer')}
                        </StyledColumnHeader>
                        <IconButton size="small" onClick={handleAnswerToggle}>
                            {displayFilter === 'B' || displayFilter === 'AB'
                                ? <VisibilityOutlined style={{fontSize: '20px'}}/>
                                : <VisibilityOffOutlined style={{fontSize: '20px'}}/>
                            }
                        </IconButton>
                    </StyledHeaderWithButton>
                </StyledBoxSideB>
            </StyledCardHeaderContent>
            <StyledHeaderCardActions>
                {/*<StyledMargin>*/}
                {/*    <GenerateAllAiSentencesButton*/}
                {/*        onGenerate={handleGenerateAll}*/}
                {/*        isGenerating={isAnyGenerating}*/}
                {/*        disabled={filteredCards.length === 0}*/}
                {/*    />*/}
                {/*</StyledMargin>*/}
                {onSelectAllChange && (
                    <StyledMarginMobile>
                        <SelectAllCards
                            checked={selectAll}
                            onChange={onSelectAllChange}
                        />
                    </StyledMarginMobile>
                )}
                {onToggleShowOnlyUnlearned && (
                    <StyledMarginMobile>
                        <ToggleShowOnlyUnlearned
                            showOnlyUnlearned={showOnlyUnlearned}
                            onToggle={onToggleShowOnlyUnlearned}
                        />
                    </StyledMarginMobile>
                )}
            </StyledHeaderCardActions>
        </StyledCardBoxHeader>
        
        <List>
          {isCreatingCard && folderId && (
            <CreateCardForm
              displayFilter={displayFilter}
              folderId={folderId}
              onSave={handleSaveCard}
              onCancel={onCancelCreateCard || (() => {})}
              onAutoSave={handleAutoSaveCard}
            />
          )}
          {!!filteredCards.length ? (
            filteredCards.map((card) => (
              <CardItem
                  key={card.id}
                  card={card}
                  handleCardClick={handleCardClick}
                  displayFilter={displayFilter}
                  expandedCardId={expandedCardId}
                  updateCardLearnStatus={updateCardLearnStatus}
                  handleMenuOpen={handleMenuOpen}
                  onReload={generateCardSentences}
                  generationStatus={generationStatuses[card.id]}
              />
            ))
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 12,
                px: 4,
              }}
            >
              <StyleOutlinedIcon
                sx={{
                  fontSize: 80,
                  color: 'text.secondary',
                  mb: 3,
                  opacity: 0.3,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                {t('cards.emptyFolder')}
              </Typography>
            </Box>
          )}
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
      </StyledBoxWrapper>
  );
};
