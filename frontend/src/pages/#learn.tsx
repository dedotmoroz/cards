import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Stack, 
  IconButton,
  Paper,
  Container,
  CircularProgress
} from '@mui/material';
import { ArrowBack, ArrowForward, Home, ThumbUp, ThumbDown, Flip } from '@mui/icons-material';
import { useCardsStore } from '@/shared/store/cardsStore';

export const LearnPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cards, fetchCards, updateCardLearnStatus, isLoading, error } = useCardsStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (folderId) {
      fetchCards(folderId);
    }
  }, [folderId, fetchCards]);

  useEffect(() => {
    // Проверяем параметр mode в URL
    const mode = searchParams.get('mode');
    if (mode === 'unlearned') {
      setShowOnlyUnlearned(true);
    }
  }, [searchParams]);

  // Сбрасываем индекс при изменении фильтра карточек
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [showOnlyUnlearned]);

  // Сбрасываем стили карточки при смене карточки
  useEffect(() => {
    if (cardRef.current) {
      // Сбрасываем только transform для свайпов, но оставляем transition для переворота
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
    }
  }, [currentIndex]);

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isAnimating) return;
      
      switch (event.code) {
        case 'ArrowRight':
          event.preventDefault();
          handleKnow();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleDontKnow();
          break;
        case 'Space':
          event.preventDefault();
          toggleAnswer();
          break;
        case 'Escape':
          event.preventDefault();
          navigate('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnimating]);

  // Обработка свайпов мышью
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = e.clientX;
    isDragging.current = true;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    const rotation = deltaX * 0.1;
    const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 300);
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    cardRef.current.style.opacity = opacity.toString();
    
    // Определяем направление свайпа
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !cardRef.current) return;
    
    isDragging.current = false;
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > 100) {
      // Свайп достаточно сильный для действия
      if (deltaX > 0) {
        handleKnow();
      } else {
        handleDontKnow();
      }
    } else {
      // Возвращаем карточку на место
      cardRef.current.style.transition = 'all 0.3s ease';
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
      setSwipeDirection(null);
    }
  };

  // Обработка касаний для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    const rotation = deltaX * 0.1;
    const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 300);
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    cardRef.current.style.opacity = opacity.toString();
    
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !cardRef.current) return;
    
    isDragging.current = false;
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > 100) {
      if (deltaX > 0) {
        handleKnow();
      } else {
        handleDontKnow();
      }
    } else {
      cardRef.current.style.transition = 'all 0.3s ease';
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
      setSwipeDirection(null);
    }
  };

  const handleKnow = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Анимация свайпа вправо
    if (cardRef.current) {
      cardRef.current.style.transition = 'all 0.5s ease';
      cardRef.current.style.transform = 'translateX(100vw) rotate(30deg)';
      cardRef.current.style.opacity = '0';
    }
    
    // Ждем завершения анимации, затем обновляем данные
    setTimeout(async () => {
      if (displayCards[currentIndex]) {
        await updateCardLearnStatus(displayCards[currentIndex].id, true);
        
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
      
      // Сбрасываем стили карточки для следующей
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
        cardRef.current.style.opacity = '1';
      }
      
      setIsAnimating(false);
    }, 500);
  };

  const handleDontKnow = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Анимация свайпа влево
    if (cardRef.current) {
      cardRef.current.style.transition = 'all 0.5s ease';
      cardRef.current.style.transform = 'translateX(-100vw) rotate(-30deg)';
      cardRef.current.style.opacity = '0';
    }
    
    // Ждем завершения анимации, затем обновляем данные
    setTimeout(async () => {
      if (displayCards[currentIndex]) {
        await updateCardLearnStatus(displayCards[currentIndex].id, false);
        
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
      
      // Сбрасываем стили карточки для следующей
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
        cardRef.current.style.opacity = '1';
      }
      
      setIsAnimating(false);
    }, 500);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleBackToFolder = () => {
    navigate('/');
  };

  const handleContinueLearning = () => {
    setShowOnlyUnlearned(true);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Загрузка карточек...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>Ошибка загрузки: {error}</Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleBackToFolder}
            sx={{ mt: 2 }}
          >
            Вернуться к папкам
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!cards.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            В этой папке нет карточек для изучения
          </Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleBackToFolder}
            sx={{ mt: 2 }}
          >
            Вернуться к папкам
          </Button>
        </Paper>
      </Container>
    );
  }

  // Фильтруем карточки в зависимости от режима
  const displayCards = showOnlyUnlearned ? cards.filter(card => !card.isLearned) : cards;

  // Если в режиме "только невыученные" и все карточки выучены
  if (showOnlyUnlearned && displayCards.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            🎉 Все карточки в этой папке выучены!
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToFolder}
            sx={{ mt: 2 }}
          >
            Вернуться к папкам
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentCard = displayCards[currentIndex];
  const isFirst = currentIndex === 0;
  const isCompleted = currentIndex === displayCards.length;

  // Проверяем, что карточка существует и индекс в пределах массива
  if (!isCompleted && (currentIndex >= displayCards.length || !currentCard)) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Ошибка: карточка не найдена
            </Typography>
          <Button
            variant="contained"
            onClick={handleBackToFolder}
            sx={{ mt: 2 }}
          >
            Вернуться к папкам
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Навигация и счетчик */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={handleBackToFolder}
          >
            Вернуться
          </Button>

          <Typography variant="h6">
            {isCompleted ? `${displayCards.length} / ${displayCards.length}` : `${currentIndex + 1} / ${displayCards.length}`}
          </Typography>

          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => {
                setCurrentIndex(Math.max(0, currentIndex - 1));
                setShowAnswer(false);
              }}
              disabled={isFirst || isAnimating}
              size="small"
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={() => {
                setCurrentIndex(Math.min(displayCards.length - 1, currentIndex + 1));
                setShowAnswer(false);
              }}
              disabled={isCompleted || isAnimating}
              size="small"
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </Box>

        {/* Карточка или экран завершения */}
        {isCompleted ? (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" gutterBottom>
              🎉 Вы изучили все карточки в этой папке!
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBackToFolder}
              >
                Вернуться к папкам
              </Button>
              {cards.some(card => !card.isLearned) && (
                <Button
                  variant="contained"
                  onClick={handleContinueLearning}
                >
                  Продолжить изучение
                </Button>
              )}
            </Stack>
          </Box>
        ) : (
          <>
            {/* Карточка с 3D эффектом переворота */}
            <Box 
              sx={{ 
                position: 'relative', 
                height: 400, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                perspective: '1000px' // Добавляем перспективу для 3D эффекта
              }}
            >
              <Box
                ref={cardRef}
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 500,
                  height: 300,
                  cursor: 'grab',
                  userSelect: 'none',
                  '&:active': {
                    cursor: 'grabbing'
                  },
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s ease-in-out',
                  transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={toggleAnswer}
              >
                {/* Передняя сторона карточки (вопрос) */}
                <Card
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CardContent sx={{ width: '100%', textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                      Вопрос:
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 3, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {currentCard.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Нажмите, чтобы увидеть ответ
                    </Typography>
                    
                    {/* Индикаторы свайпа */}
                    {swipeDirection && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          ...(swipeDirection === 'right' ? { right: 20 } : { left: 20 }),
                          color: swipeDirection === 'right' ? 'success.main' : 'error.main',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {swipeDirection === 'right' ? '✓ ЗНАЮ' : '✗ НЕ ЗНАЮ'}
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Задняя сторона карточки (ответ) */}
                <Card
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CardContent sx={{ width: '100%', textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                      Ответ:
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 3, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {currentCard.answer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Нажмите, чтобы увидеть вопрос
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Кнопки действий */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleDontKnow}
                disabled={isAnimating}
                size="large"
                startIcon={<ThumbDown />}
                sx={{ 
                  minWidth: 120,
                  transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}
              >
                ← Не знаю
              </Button>
              <Button
                variant="outlined"
                onClick={toggleAnswer}
                disabled={isAnimating}
                size="large"
                startIcon={<Flip />}
                sx={{ minWidth: 120 }}
              >
                Перевернуть
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleKnow}
                disabled={isAnimating}
                size="large"
                startIcon={<ThumbUp />}
                sx={{ 
                  minWidth: 120,
                  transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}
              >
                Знаю →
              </Button>
            </Stack>

            {/* Подсказки по управлению */}
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                💡 Управление: ← Не знаю | → Знаю | Пробел - перевернуть | ESC - назад
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};