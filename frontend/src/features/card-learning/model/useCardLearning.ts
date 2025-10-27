import { useState, useEffect, useRef } from 'react';
import { useCardsStore } from '@/shared/store/cardsStore';
import type { Card } from '@/shared/types/cards';

export const useCardLearning = (folderId: string | undefined) => {
  const { cards, fetchCards, updateCardLearnStatus, isLoading, error } = useCardsStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [unlearnedCount, setUnlearnedCount] = useState(0);
  const [unlearnedCards, setUnlearnedCards] = useState<Card[]>([]);
  const [initialDisplayCardsCount, setInitialDisplayCardsCount] = useState(0);
  const lastFetchedFolderId = useRef<string | null>(null);

  // Загружаем карточки при монтировании
  useEffect(() => {
    if (folderId && folderId !== lastFetchedFolderId.current) {
      lastFetchedFolderId.current = folderId;
      fetchCards(folderId);
    }
  }, [folderId]); // Загружаем только если папка изменилась

  // Сбрасываем индекс при изменении фильтра карточек
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [showOnlyUnlearned]);

  // Сбрасываем счетчики при смене папки
  useEffect(() => {
    if (folderId && folderId !== lastFetchedFolderId.current) {
      setLearnedCount(0);
      setUnlearnedCount(0);
      setUnlearnedCards([]);
    }
  }, [folderId]);

  // Инициализируем initialDisplayCardsCount при первой загрузке карточек
  useEffect(() => {
    if (cards.length > 0 && initialDisplayCardsCount === 0) {
      setInitialDisplayCardsCount(cards.length);
    }
  }, [cards, initialDisplayCardsCount]);

  // Фильтруем карточки в зависимости от режима
  const displayCards = showOnlyUnlearned ? unlearnedCards : cards;
  const currentCard = displayCards[currentIndex];
  const isCompleted = currentIndex >= initialDisplayCardsCount;

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleKnow = async () => {
    if (currentCard) {
      await updateCardLearnStatus(currentCard.id, true);
      setLearnedCount(prev => prev + 1);
      
      if (showOnlyUnlearned) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
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
      setUnlearnedCount(prev => prev + 1);
      
      if (showOnlyUnlearned) {
        // Переходим к следующей карточке
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
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
    // Сбрасываем счетчики и индекс при продолжении обучения
    setLearnedCount(0);
    setUnlearnedCount(0);
    setCurrentIndex(0);
    setShowAnswer(false);
    // Обновляем массив невыученных карточек
    if (unlearnedOnly && cards.length > 0) {
      const unlearned = cards.filter(card => !card.isLearned);
      setUnlearnedCards(unlearned);
      setInitialDisplayCardsCount(unlearned.length);
    } else if (cards.length > 0) {
      setInitialDisplayCardsCount(cards.length);
    }
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
    learnedCount,
    unlearnedCount,
    initialDisplayCardsCount,
    
    // Actions
    toggleAnswer,
    handleKnow,
    handleDontKnow,
    navigateToCard,
    setLearningMode,
  };
};
