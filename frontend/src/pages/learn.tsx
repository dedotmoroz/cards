import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Paper, Typography, Button } from '@mui/material';
import { Home } from '@mui/icons-material';

// Features
import { useCardLearning } from '@/features/card-learning/model/useCardLearning';
import { useCardSwipe } from '@/features/card-swipe/model/useCardSwipe';
import { LearnProcess } from '@/widgets/learn-process';

export const LearnPage = () => {
  const { t } = useTranslation();
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
  }, [searchParams, learning]);

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

  // Navigation handlers
  const handleBackToFolders = () => navigate('/');

  // Loading state
  // if (learning.isLoading) {
  //   return (
  //     <Container maxWidth="md" sx={{ mt: 4 }}>
  //       <Paper sx={{ p: 4, textAlign: 'center' }}>
  //         <CircularProgress />
  //         <Typography sx={{ mt: 2 }}>Загрузка карточек...</Typography>
  //       </Paper>
  //     </Container>
  //   );
  // }

  // Error state
  if (learning.error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>{t('errors.generic')}: {learning.error}</Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleBackToFolders}
            sx={{ mt: 2 }}
          >
            {t('forms.back')}
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
            {t('learning.allLearned')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleBackToFolders}
            sx={{ mt: 2 }}
          >
            {t('forms.back')}
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
            🎉 {t('learning.allLearned')}
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToFolders}
            sx={{ mt: 2 }}
          >
            {t('forms.back')}
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
            {t('errors.notFound')}
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToFolders}
            sx={{ mt: 2 }}
          >
            {t('forms.back')}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{mt: 4,}}>
            <LearnProcess learning={learning} />
    </Container>
  );
};
