import { useState, useEffect } from 'react';
import { useCardsStore } from '@/shared/store/cardsStore';

export const useCardLearning = (folderId: string | undefined) => {
  const { cards, fetchCards, updateCardLearnStatus, isLoading, error } = useCardsStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);

  // Загружаем карточки при монтировании
  useEffect(() => {
    if (folderId) {
      fetchCards(folderId);
    }
  }, [folderId, fetchCards]);

  // Сбрасываем индекс при изменении фильтра карточек
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [showOnlyUnlearned]);

  // Фильтруем карточки в зависимости от режима
  const displayCards = showOnlyUnlearned ? cards.filter(card => !card.isLearned) : cards;
  const currentCard = displayCards[currentIndex];
  const isCompleted = currentIndex === displayCards.length;

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleKnow = async () => {
    if (currentCard) {
      await updateCardLearnStatus(currentCard.id, true);
      
      if (showOnlyUnlearned) {
        const updatedCards = cards.filter(card => !card.isLearned);
        if (currentIndex >= updatedCards.length - 1) {
          setCurrentIndex(updatedCards.length);
        } else {
          setShowAnswer(false);
        }
      } else {
        if (currentIndex < displayCards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowAnswer(false);
        } else {
          setCurrentIndex(displayCards.length);
          setShowAnswer(false);
        }
      }
    }
  };

  const handleDontKnow = async () => {
    if (currentCard) {
      await updateCardLearnStatus(currentCard.id, false);
      
      if (showOnlyUnlearned) {
        if (currentIndex < displayCards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowAnswer(false);
        } else {
          setCurrentIndex(displayCards.length);
          setShowAnswer(false);
        }
      } else {
        if (currentIndex < displayCards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowAnswer(false);
        } else {
          setCurrentIndex(displayCards.length);
          setShowAnswer(false);
        }
      }
    }
  };

  const navigateToCard = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(displayCards.length - 1, index)));
    setShowAnswer(false);
  };

  const setLearningMode = (unlearnedOnly: boolean) => {
    setShowOnlyUnlearned(unlearnedOnly);
  };

  return {
    // State
    cards,
    displayCards,
    currentCard,
    currentIndex,
    showAnswer,
    showOnlyUnlearned,
    isCompleted,
    isLoading,
    error,
    
    // Actions
    toggleAnswer,
    handleKnow,
    handleDontKnow,
    navigateToCard,
    setLearningMode,
  };
};
