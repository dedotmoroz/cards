import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { contextReadingApi, type ContextReadingGenerateStatusResponse } from '@/shared/api/contextReadingApi';
import { useSEO } from '@/shared/hooks/useSEO';

const POLLING_INTERVAL = 2000; // 2 seconds

export const ContextReadingPage = () => {
  const { t, i18n } = useTranslation();
  const { folderId } = useParams<{ userId?: string; folderId?: string }>();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ContextReadingGenerateStatusResponse | null>(null);
  
  // Используем ref для предотвращения повторных вызовов
  const lastProcessedKeyRef = useRef<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useSEO({
    title: t('seo.contextReading.title', { defaultValue: 'Context Reading' }),
    description: t('seo.contextReading.description', { defaultValue: 'Read context with cards' }),
    keywords: t('seo.keywords'),
    lang: i18n.language,
  });

  useEffect(() => {
    if (!folderId) {
      setError('Folder ID is required');
      setLoading(false);
      return;
    }

    // Создаем уникальный ключ для этой комбинации folderId и language
    const currentKey = `${folderId}-${i18n.language}`;
    
    // Предотвращаем повторные вызовы для той же комбинации
    if (lastProcessedKeyRef.current === currentKey) {
      return;
    }

    lastProcessedKeyRef.current = currentKey;

    const startGeneration = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Получаем карточки
        const nextCardsResponse = await contextReadingApi.getNextCards(folderId, 5);
        
        if (nextCardsResponse.completed || nextCardsResponse.cards.length === 0) {
          setError('No cards available for context reading');
          setLoading(false);
          return;
        }

        // 2. Запускаем генерацию текста
        const cardIds = nextCardsResponse.cards.map(card => card.id);
        const lang = i18n.language || 'en';
        const level = 'B1'; // Можно сделать настраиваемым

        const generateResponse = await contextReadingApi.generateText({
          cardIds,
          lang,
          level,
        });

        setGenerating(true);
        setLoading(false);

        // 3. Начинаем опрос статуса
        const pollStatus = async (jobId: string) => {
          const poll = async (): Promise<void> => {
            // Проверяем, не изменился ли ключ (folderId или language)
            const currentKey = `${folderId}-${i18n.language}`;
            if (lastProcessedKeyRef.current !== currentKey) {
              return;
            }

            try {
              const statusResponse = await contextReadingApi.getGenerateStatus(jobId);
              setStatus(statusResponse);

              if (statusResponse.state === 'completed') {
                setGenerating(false);
                return;
              }

              if (statusResponse.state === 'failed') {
                setGenerating(false);
                setError(statusResponse.error || 'Generation failed');
                return;
              }

              // Продолжаем опрос
              pollingTimeoutRef.current = setTimeout(poll, POLLING_INTERVAL);
            } catch (err) {
              setGenerating(false);
              setError(err instanceof Error ? err.message : 'Failed to fetch status');
            }
          };

          // Начинаем опрос через небольшую задержку
          pollingTimeoutRef.current = setTimeout(poll, POLLING_INTERVAL);
        };

        await pollStatus(generateResponse.jobId);
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to start generation');
      }
    };

    startGeneration();

    // Cleanup функция для отмены опроса при размонтировании или изменении зависимостей
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [folderId, i18n.language]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (generating && status) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1">
            {t('contextReading.generating', { defaultValue: 'Generating text...' })} ({status.progress}%)
          </Typography>
        </Box>
      </Container>
    );
  }

  if (status?.state === 'completed' && status.result) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('contextReading.title', { defaultValue: 'Context Reading' })}
        </Typography>
        
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('contextReading.text', { defaultValue: 'Text' })}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              mb: 4,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }}
          >
            {status.result.text}
          </Typography>

          <Typography variant="h6" gutterBottom>
            {t('contextReading.translation', { defaultValue: 'Translation' })}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }}
          >
            {status.result.translation}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Alert severity="info">
        {t('contextReading.waiting', { defaultValue: 'Waiting for generation to start...' })}
      </Alert>
    </Container>
  );
};

