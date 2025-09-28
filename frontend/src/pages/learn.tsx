import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, CircularProgress, Typography, Box, Button } from '@mui/material';
import { Home } from '@mui/icons-material';

// Shared UI
import { CardFlip } from '@/shared/ui/card-flip/card-flip';

// Features
import { useCardLearning } from '@/features/card-learning/model/useCardLearning';
import { useCardSwipe } from '@/features/card-swipe/model/useCardSwipe';
import { LearningControls } from '@/features/card-learning/ui/learning-controls';
import { LearningNavigation } from '@/features/card-learning/ui/learning-navigation';
import { CompletionScreen } from '@/features/learning-completion/ui/completion-screen';

export const LearnPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Hooks
  const learning = useCardLearning(folderId);
  const swipe = useCardSwipe();

  // URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'unlearned') {
      learning.setLearningMode(true);
    }
  }, [searchParams]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (swipe.isAnimating) return;
      
      switch (event.code) {
        case 'ArrowRight':
          event.preventDefault();
          learning.handleKnow();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          learning.handleDontKnow();
          break;
        case 'Space':
          event.preventDefault();
          learning.toggleAnswer();
          break;
        case 'Escape':
          event.preventDefault();
          navigate('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [swipe.isAnimating, learning, navigate]);

  // Swipe handlers
  // const handleSwipeAction = (action: string) => {
  //   switch (action) {
  //     case 'know':
  //       learning.handleKnow();
  //       break;
  //     case 'dontKnow':
  //       learning.handleDontKnow();
  //       break;
  //   }
  // };

  // const handleMouseUp = () => {
  //   const result = swipe.handleMouseUp();
  //   if (result) {
  //     handleSwipeAction(result.action);
  //   }
  // };
  //
  // const handleTouchEnd = () => {
  //   const result = swipe.handleTouchEnd();
  //   if (result) {
  //     handleSwipeAction(result.action);
  //   }
  // };

  // Navigation handlers
  const handleBackToFolders = () => navigate('/');
  const handleContinueLearning = () => learning.setLearningMode(true);
  const handlePrevious = () => learning.navigateToCard(learning.currentIndex - 1);
  const handleNext = () => learning.navigateToCard(learning.currentIndex + 1);

  // Loading state
  if (learning.isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Загрузка карточек...</Typography>
        </Paper>
      </Container>
    );
  }

  // Error state
  if (learning.error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>Ошибка загрузки: {learning.error}</Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleBackToFolders}
            sx={{ mt: 2 }}
          >
            Вернуться к папкам
          </Button>
        </Paper>
      </Container>
    );
  }

  // No cards state
  if (!learning.cards.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            В этой папке нет карточек для изучения
          </Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleBackToFolders}
            sx={{ mt: 2 }}
          >
            Вернуться к папкам
          </Button>
        </Paper>
      </Container>
    );
  }

  // All cards learned state
  if (learning.showOnlyUnlearned && learning.displayCards.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            🎉 Все карточки в этой папке выучены!
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToFolders}
            sx={{ mt: 2 }}
          >
            Вернуться к папкам
          </Button>
        </Paper>
      </Container>
    );
  }

  // Card not found state
  if (!learning.isCompleted && (learning.currentIndex >= learning.displayCards.length || !learning.currentCard)) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Ошибка: карточка не найдена
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToFolders}
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
        {/* Navigation */}
        <LearningNavigation
          currentIndex={learning.currentIndex}
          totalCards={learning.displayCards.length}
          isCompleted={learning.isCompleted}
          isFirst={learning.currentIndex === 0}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onBack={handleBackToFolders}
          disabled={swipe.isAnimating}
        />

        {/* Card or completion screen */}
        {learning.isCompleted ? (
          <CompletionScreen
            onBackToFolders={handleBackToFolders}
            onContinueLearning={handleContinueLearning}
            hasUnlearnedCards={learning.cards.some(card => !card.isLearned)}
          />
        ) : (
          <>
            {/* 3D Card with swipe support */}
              <CardFlip
                ref={swipe.cardRef}
                question={learning.currentCard.question}
                answer={learning.currentCard.answer}
                showAnswer={learning.showAnswer}
                onClick={learning.toggleAnswer}
                // onMouseDown={swipe.handleMouseDown}
                // onMouseMove={swipe.handleMouseMove}
                // onMouseUp={handleMouseUp}
                // onMouseLeave={handleMouseUp}
                // onTouchStart={swipe.handleTouchStart}
                // onTouchMove={swipe.handleTouchMove}
                // onTouchEnd={handleTouchEnd}
              />

            {/* Controls */}
            <LearningControls
              onKnow={learning.handleKnow}
              onDontKnow={learning.handleDontKnow}
              onFlip={learning.toggleAnswer}
              disabled={swipe.isAnimating}
            />

            {/* Help text */}
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
