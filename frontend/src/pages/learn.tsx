import { useState, useEffect } from 'react';
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
  Container
} from '@mui/material';
import { ArrowBack, ArrowForward, Home } from '@mui/icons-material';
import { useCardsStore } from '@/shared/store/cardsStore';

export const LearnPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cards, fetchCards, updateCardLearnStatus } = useCardsStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);

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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < displayCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handleKnow = async () => {
    if (displayCards[currentIndex]) {
      await updateCardLearnStatus(displayCards[currentIndex].id, true);
      
      // Если в режиме "только невыученные", карточка исчезнет из списка
      if (showOnlyUnlearned) {
        // Обновляем список карточек после изменения статуса
        const updatedCards = cards.filter(card => !card.isLearned);
        if (currentIndex >= updatedCards.length - 1) {
          // Если это была последняя карточка или после неё не осталось карточек
          setCurrentIndex(updatedCards.length);
        } else {
          // Переходим к следующей карточке (индекс остается тот же, так как список сдвинулся)
          setShowAnswer(false);
        }
      } else {
        // В обычном режиме просто переходим к следующей карточке
        if (currentIndex < displayCards.length - 1) {
          handleNext();
        } else {
          setCurrentIndex(displayCards.length);
          setShowAnswer(false);
        }
      }
    }
  };

  const handleDontKnow = async () => {
    if (displayCards[currentIndex]) {
      await updateCardLearnStatus(displayCards[currentIndex].id, false);
      
      // В режиме "только невыученные" карточка остается в списке
      if (showOnlyUnlearned) {
        if (currentIndex < displayCards.length - 1) {
          handleNext();
        } else {
          setCurrentIndex(displayCards.length);
          setShowAnswer(false);
        }
      } else {
        // В обычном режиме
        if (currentIndex < displayCards.length - 1) {
          handleNext();
        } else {
          setCurrentIndex(displayCards.length);
          setShowAnswer(false);
        }
      }
    }
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
            startIcon={<Home />}
            onClick={handleBackToFolder}
            variant="outlined"
          >
            Вернуться
          </Button>
          
          <Typography variant="h6">
            {isCompleted ? `${displayCards.length} / ${displayCards.length}` : `${currentIndex + 1} / ${displayCards.length}`}
          </Typography>
          
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={handlePrevious} 
              disabled={isFirst}
              size="small"
            >
              <ArrowBack />
            </IconButton>
            <IconButton 
              onClick={handleNext} 
              disabled={isCompleted}
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
              {!showOnlyUnlearned && cards.some(card => !card.isLearned) && (
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
            <Card 
              sx={{ 
                minHeight: 300, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={toggleAnswer}
            >
              <CardContent sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {showAnswer ? 'Ответ:' : 'Вопрос:'}
                </Typography>
                <Typography variant="h4" sx={{ mb: 3 }}>
                  {showAnswer ? currentCard.answer : currentCard.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {showAnswer ? 'Нажмите, чтобы увидеть вопрос' : 'Нажмите, чтобы увидеть ответ'}
                </Typography>
              </CardContent>
            </Card>

            {/* Кнопки действий */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="error"
                onClick={handleDontKnow}
                size="large"
              >
                Не знаю
              </Button>
              <Button 
                variant="contained" 
                color="success"
                onClick={handleKnow}
                size="large"
              >
                Знаю
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
};