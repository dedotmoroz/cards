import { useState, useEffect, useRef, useMemo } from 'react';
import { useCardsStore } from '@/shared/store/cardsStore';
import type { Card } from '@/shared/types/cards';

export const useCardLearning = (folderId: string | undefined, initialSideFromUrl?: 'question' | 'answer') => {
  const { cards, fetchCards, updateCardLearnStatus, isLoading, error } = useCardsStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
  const [phrasesMode, setPhrasesMode] = useState(false);
  const [initialSideState, setInitialSideState] = useState<'question' | 'answer'>(initialSideFromUrl || 'question');
  // Используем ref для хранения актуального значения initialSide
  const initialSideRef = useRef<'question' | 'answer'>(initialSideFromUrl || 'question');
  // showAnswer = true означает показывать question (согласно логике CardFlip: showAnswer ? question : answer)
  // Инициализируем showAnswer в зависимости от initialSide
  // Если initialSide = 'answer', то showAnswer = false (показываем answer)
  // Если initialSide = 'question', то showAnswer = true (показываем question)
  const [showAnswer, setShowAnswer] = useState(() => {
    const shouldShowAnswer = (initialSideFromUrl || 'question') === 'question';
    return shouldShowAnswer;
  });
  const [learnedCount, setLearnedCount] = useState(0);
  const [unlearnedCount, setUnlearnedCount] = useState(0);
  const [unlearnedCards, setUnlearnedCards] = useState<Card[]>([]);
  const [initialDisplayCardsCount, setInitialDisplayCardsCount] = useState(0);
  const lastFetchedFolderId = useRef<string | null>(null);
  // Флаг для отслеживания, что мы находимся в процессе обновления карточки
  const isUpdatingCardRef = useRef(false);

  // Загружаем карточки при монтировании
  useEffect(() => {
    if (folderId && folderId !== lastFetchedFolderId.current) {
      lastFetchedFolderId.current = folderId;
      fetchCards(folderId);
    }
  }, [folderId]); // Загружаем только если папка изменилась

  // Сбрасываем индекс при изменении фильтра карточек
  // Используем ref для отслеживания предыдущих значений, чтобы не сбрасывать при каждом рендере
  const prevShowOnlyUnlearnedRef = useRef(showOnlyUnlearned);
  const prevPhrasesModeRef = useRef(phrasesMode);
  useEffect(() => {
    // Сбрасываем только если режим действительно изменился
    if (prevShowOnlyUnlearnedRef.current !== showOnlyUnlearned || prevPhrasesModeRef.current !== phrasesMode) {
      setCurrentIndex(0);
      setShowAnswer(initialSideRef.current === 'question');
      // Сбрасываем счетчики только при изменении режима
      setLearnedCount(0);
      setUnlearnedCount(0);
      prevShowOnlyUnlearnedRef.current = showOnlyUnlearned;
      prevPhrasesModeRef.current = phrasesMode;
    }
  }, [showOnlyUnlearned, phrasesMode]);

  // Сбрасываем счетчики при смене папки
  useEffect(() => {
    if (folderId && folderId !== lastFetchedFolderId.current) {
      setLearnedCount(0);
      setUnlearnedCount(0);
      setUnlearnedCards([]);
    }
  }, [folderId]);

  // Обновляем unlearnedCards при изменении cards
  // НЕ сбрасываем счетчики при обновлении unlearnedCards
  useEffect(() => {
    if (cards.length > 0) {
      const unlearned = cards.filter(card => !card.isLearned);
      setUnlearnedCards(unlearned);
    } else {
      setUnlearnedCards([]);
    }
  }, [cards]);

  // Инициализируем initialDisplayCardsCount только при изменении режима или первой загрузке
  // Используем ref для отслеживания предыдущего значения режима
  const prevPhrasesModeForCountRef = useRef(phrasesMode);
  const prevShowOnlyUnlearnedForCountRef = useRef(showOnlyUnlearned);
  const initialCountSetRef = useRef(false);
  useEffect(() => {
    // Обновляем initialDisplayCardsCount только если режим изменился или это первая загрузка
    const modeChanged = prevPhrasesModeForCountRef.current !== phrasesMode || 
                       prevShowOnlyUnlearnedForCountRef.current !== showOnlyUnlearned;
    
    if (modeChanged) {
      initialCountSetRef.current = false;
      prevPhrasesModeForCountRef.current = phrasesMode;
      prevShowOnlyUnlearnedForCountRef.current = showOnlyUnlearned;
    }
    
    if (cards.length > 0 && (!initialCountSetRef.current || modeChanged)) {
      if (phrasesMode) {
        const cardsWithPhrases = cards.filter(card => card.questionSentences && card.answerSentences);
        if (cardsWithPhrases.length > 0) {
          setInitialDisplayCardsCount(cardsWithPhrases.length);
          initialCountSetRef.current = true;
        }
      } else if (showOnlyUnlearned) {
        const unlearned = cards.filter(card => !card.isLearned);
        if (unlearned.length > 0) {
          setInitialDisplayCardsCount(unlearned.length);
          initialCountSetRef.current = true;
        }
      } else {
        setInitialDisplayCardsCount(cards.length);
        initialCountSetRef.current = true;
      }
    }
  }, [cards, phrasesMode, showOnlyUnlearned]);

  // Фильтруем карточки в зависимости от режима
  const displayCards = useMemo(() => {
    let filteredCards = showOnlyUnlearned ? unlearnedCards : cards;
    if (phrasesMode) {
      filteredCards = filteredCards.filter(card => card.questionSentences && card.answerSentences);
    }
    return filteredCards;
  }, [cards, unlearnedCards, showOnlyUnlearned, phrasesMode]);
  
  // Защита от выхода индекса за границы при изменении displayCards
  // НЕ сбрасываем индекс, если мы находимся в процессе обновления карточки
  useEffect(() => {
    if (!isUpdatingCardRef.current && displayCards.length > 0 && currentIndex >= displayCards.length) {
      // Если индекс вышел за границы, устанавливаем на последнюю карточку
      setCurrentIndex(displayCards.length - 1);
    }
  }, [displayCards, currentIndex]);
  
  // Защита от выхода за границы массива
  const safeIndex = Math.min(currentIndex, displayCards.length - 1);
  const currentCard = displayCards[safeIndex >= 0 ? safeIndex : 0];
  const isCompleted = currentIndex >= displayCards.length;

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleKnow = async () => {
    if (!currentCard) return;
    
    const currentCardId = currentCard.id;
    const currentCardIndexInDisplay = displayCards.findIndex(card => card.id === currentCardId);
    
    if (currentCardIndexInDisplay === -1) return;
    
    // Сохраняем индекс следующей карточки ДО обновления статуса
    const nextIndex = currentCardIndexInDisplay + 1;
    
    // Устанавливаем флаг, что мы обновляем карточку
    isUpdatingCardRef.current = true;
    
    try {
      // Обновляем статус карточки
      await updateCardLearnStatus(currentCardId, true);
      
      // Увеличиваем счетчик
      setLearnedCount(prev => prev + 1);
      
      // Переходим к следующей карточке
      // Просто увеличиваем индекс - защита от выхода за границы есть через safeIndex
      setCurrentIndex(nextIndex);
      setShowAnswer(initialSideRef.current === 'question');
    } finally {
      // Сбрасываем флаг после небольшой задержки, чтобы дать время для обновления displayCards
      setTimeout(() => {
        isUpdatingCardRef.current = false;
      }, 100);
    }
  };

  const handleDontKnow = async () => {
    if (!currentCard) return;
    
    const currentCardId = currentCard.id;
    const currentCardIndexInDisplay = displayCards.findIndex(card => card.id === currentCardId);
    
    if (currentCardIndexInDisplay === -1) return;
    
    // Сохраняем индекс следующей карточки ДО обновления статуса
    const nextIndex = currentCardIndexInDisplay + 1;
    
    // Устанавливаем флаг, что мы обновляем карточку
    isUpdatingCardRef.current = true;
    
    try {
      // Обновляем статус карточки
      await updateCardLearnStatus(currentCardId, false);
      
      // Увеличиваем счетчик
      setUnlearnedCount(prev => prev + 1);
      
      // Переходим к следующей карточке
      // Просто увеличиваем индекс - защита от выхода за границы есть через safeIndex
      setCurrentIndex(nextIndex);
      setShowAnswer(initialSideRef.current === 'question');
    } finally {
      // Сбрасываем флаг после небольшой задержки, чтобы дать время для обновления displayCards
      setTimeout(() => {
        isUpdatingCardRef.current = false;
      }, 100);
    }
  };

  const navigateToCard = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(displayCards.length - 1, index)));
    setShowAnswer(initialSideRef.current === 'question');
  };

  const setLearningMode = (unlearnedOnly: boolean) => {
    setShowOnlyUnlearned(unlearnedOnly);
    setPhrasesMode(false);
    // Сбрасываем счетчики и индекс при продолжении обучения
    setLearnedCount(0);
    setUnlearnedCount(0);
    setCurrentIndex(0);
    // Используем ref для получения актуального значения initialSide
    setShowAnswer(initialSideRef.current === 'question');
    // Обновляем массив невыученных карточек
    if (unlearnedOnly && cards.length > 0) {
      const unlearned = cards.filter(card => !card.isLearned);
      setUnlearnedCards(unlearned);
      setInitialDisplayCardsCount(unlearned.length);
    } else if (cards.length > 0) {
      setInitialDisplayCardsCount(cards.length);
    }
  };

  const setPhrasesModeHandler = (enabled: boolean) => {
    setPhrasesMode(enabled);
    setShowOnlyUnlearned(false);
    // Сбрасываем счетчики и индекс
    setLearnedCount(0);
    setUnlearnedCount(0);
    setCurrentIndex(0);
    // Используем ref для получения актуального значения initialSide
    setShowAnswer(initialSideRef.current === 'question');
    // Обновляем количество карточек с предложениями
    if (enabled && cards.length > 0) {
      const cardsWithPhrases = cards.filter(card => card.questionSentences && card.answerSentences);
      setInitialDisplayCardsCount(cardsWithPhrases.length);
    } else if (cards.length > 0) {
      setInitialDisplayCardsCount(cards.length);
    }
  };

  const setInitialSide = (side: 'question' | 'answer') => {
    // Обновляем ref СНАЧАЛА, чтобы эффекты могли использовать актуальное значение
    initialSideRef.current = side;
    setInitialSideState(side);
    
    // В CardFlip: showAnswer ? question : answer
    // Если side = 'question', то showAnswer = true (показываем question)
    // Если side = 'answer', то showAnswer = false (показываем answer)
    // Меняем showAnswer для текущей карточки сразу
    setShowAnswer(side === 'question');
  };

  const initialSide = initialSideState;

  return {
    // State
    cards,
    displayCards,
    currentCard,
    currentIndex,
    showAnswer,
    showOnlyUnlearned,
    phrasesMode,
    isCompleted,
    isLoading,
    error,
    learnedCount,
    unlearnedCount,
    initialDisplayCardsCount,
    initialSide,
    
    // Actions
    toggleAnswer,
    handleKnow,
    handleDontKnow,
    navigateToCard,
    setLearningMode,
    setPhrasesMode: setPhrasesModeHandler,
    setInitialSide,
  };
};
