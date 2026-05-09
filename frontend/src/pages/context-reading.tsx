import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { contextReadingApi, type ContextReadingGenerateStatusResponse } from '@/shared/api/contextReadingApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { ProfileHeader } from '@/entities/user';
import { ButtonColor, ButtonLink } from '@/shared/ui';

const POLLING_INTERVAL = 2000; // 2 seconds

export const ContextReadingPage = () => {
  const { t, i18n } = useTranslation();
  const { userId, folderId } = useParams<{ userId?: string; folderId?: string }>();
  const learnFolderPath = userId && folderId ? `/learn/${userId}/${folderId}` : undefined;
  const languageLevelAriaLabel = t('contextReading.languageLevel', { defaultValue: 'Language level' });
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ContextReadingGenerateStatusResponse | null>(null);
  const [currentCards, setCurrentCards] = useState<Array<{ question: string; answer: string }>>([]);
  const [progress, setProgress] = useState<{ used: number; total: number } | null>(null);
  const [languageLevel, setLanguageLevel] = useState<string>('B1');
  
  // Используем ref для предотвращения повторных вызовов
  const lastProcessedKeyRef = useRef<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useSEO({
    title: t('seo.contextReading.title', { defaultValue: 'Context Reading' }),
    description: t('seo.contextReading.description', { defaultValue: 'Read context with cards' }),
    keywords: t('seo.keywords'),
    lang: i18n.language,
  });

  // Функция для запуска генерации текста
  const startGeneration = async () => {
    if (!folderId) {
      setError('Folder ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStatus(null);

      // 1. Получаем карточки
      const nextCardsResponse = await contextReadingApi.getNextCards(folderId, 5);
      
      if (nextCardsResponse.completed || nextCardsResponse.cards.length === 0) {
        setError('No cards available for context reading');
        setLoading(false);
        return;
      }

      // Сохраняем информацию о карточках для отображения
      setCurrentCards(nextCardsResponse.cards.map(card => ({
        question: card.question,
        answer: card.answer,
      })));

      // Сохраняем информацию о прогрессе
      setProgress(nextCardsResponse.progress);

      // 2. Запускаем генерацию текста
      const cardIds = nextCardsResponse.cards.map(card => card.id);
      const lang = i18n.language || 'en';

      const generateResponse = await contextReadingApi.generateText({
        cardIds,
        lang,
        level: languageLevel,
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

  // Обработчик кнопки "Сброс"
  const handleReset = async () => {
    if (!folderId) return;

    try {
      // Очищаем предыдущий таймер polling, если он есть
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      
      setLoading(true);
      setError(null);
      setStatus(null);
      setCurrentCards([]);
      setProgress(null);
      
      // Сбрасываем прогресс
      await contextReadingApi.resetProgress(folderId);
      
      // Обновляем ключ, чтобы разрешить новую генерацию
      const currentKey = `${folderId}-${i18n.language}`;
      lastProcessedKeyRef.current = currentKey;
      
      // Запускаем генерацию заново
      await startGeneration();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to reset progress');
    }
  };

  // Обработчик кнопки "Вперед"
  const handleNext = async () => {
    if (!folderId) return;

    try {
      // Очищаем предыдущий таймер polling, если он есть
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      
      // Обновляем ключ, чтобы разрешить новую генерацию
      const currentKey = `${folderId}-${i18n.language}`;
      lastProcessedKeyRef.current = currentKey;
      
      // Запускаем генерацию следующей порции
      await startGeneration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next cards');
    }
  };

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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} disabled />}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={languageLevel}
              inputProps={{ 'aria-label': languageLevelAriaLabel }}
              onChange={(e) => setLanguageLevel(e.target.value)}
              disabled={true}
            >
              <MenuItem value="A1">A1</MenuItem>
              <MenuItem value="A2">A2</MenuItem>
              <MenuItem value="B1">B1</MenuItem>
              <MenuItem value="B2">B2</MenuItem>
              <MenuItem value="C1">C1</MenuItem>
              <MenuItem value="C2">C2</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    const isNoCardsError = error === 'No cards available for context reading';
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={languageLevel}
              inputProps={{ 'aria-label': languageLevelAriaLabel }}
              onChange={(e) => setLanguageLevel(e.target.value)}
              disabled={loading || generating}
            >
              <MenuItem value="A1">A1</MenuItem>
              <MenuItem value="A2">A2</MenuItem>
              <MenuItem value="B1">B1</MenuItem>
              <MenuItem value="B2">B2</MenuItem>
              <MenuItem value="C1">C1</MenuItem>
              <MenuItem value="C2">C2</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        {isNoCardsError && folderId && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={loading || generating}
              sx={{ minWidth: 120 }}
            >
              {t('contextReading.reset', { defaultValue: 'Сброс' })}
            </Button>
          </Box>
        )}
      </Container>
    );
  }

  // Показываем процесс генерации
  if (generating && status && status.state !== 'completed') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} disabled />}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={languageLevel}
              inputProps={{ 'aria-label': languageLevelAriaLabel }}
              onChange={(e) => setLanguageLevel(e.target.value)}
              disabled={true}
            >
              <MenuItem value="A1">A1</MenuItem>
              <MenuItem value="A2">A2</MenuItem>
              <MenuItem value="B1">B1</MenuItem>
              <MenuItem value="B2">B2</MenuItem>
              <MenuItem value="C1">C1</MenuItem>
              <MenuItem value="C2">C2</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 'calc(100dvh - 200px)',
            px: 2,
            pb: 4,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1">
            {t('contextReading.generating', { defaultValue: 'Generating text...' })} ({status.progress}%)
          </Typography>
        </Box>
      </Container>
    );
  }

  // Показываем результат с кнопками
  if (status?.state === 'completed' && status.result) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ ml: 4 }}>
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={languageLevel}
              inputProps={{ 'aria-label': languageLevelAriaLabel }}
              onChange={(e) => setLanguageLevel(e.target.value)}
              disabled={loading || generating}
            >
              <MenuItem value="A1">A1</MenuItem>
              <MenuItem value="A2">A2</MenuItem>
              <MenuItem value="B1">B1</MenuItem>
              <MenuItem value="B2">B2</MenuItem>
              <MenuItem value="C1">C1</MenuItem>
              <MenuItem value="C2">C2</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Список слов */}
        {currentCards.length > 0 && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('contextReading.words', { defaultValue: 'Слова из контента' })}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentCards.map((card, index) => (
                <Chip
                  key={index}
                  size="small"
                  variant="outlined"
                  label={
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography variant="body2" component="span" fontWeight="medium">
                        {card.question}
                      </Typography>
                      <Typography variant="body2" component="span" color="text.secondary">
                        ({card.answer})
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Box>
          </Box>
        )}
        
        <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" component="span" sx={{ ml: 2 }}>
                {t('contextReading.text', { defaultValue: 'Text' })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {status.result.text}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" component="span" sx={{ ml: 2 }}>
                {t('contextReading.translation', { defaultValue: 'Translation' })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {status.result.translation}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Прогресс и кнопки управления */}
        <Box
          sx={{
            mt: 4,
            mb: 4,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {progress && (
            <Typography variant="body1" color="text.secondary" sx={{ ml: 4 }}>
              {t('contextReading.progress', {
                used: progress.used,
                total: progress.total,
                remaining: progress.total - progress.used,
                defaultValue: `${progress.used}/${progress.total} (осталось: ${progress.total - progress.used})`,
              })}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', ml: 'auto' }}>
            <ButtonLink
              onClick={handleReset}
              disabled={loading || generating}
              sx={{ width: 120 }}
            >
              {t('contextReading.reset', { defaultValue: 'Сброс' })}
            </ButtonLink>
            <ButtonColor
              onClick={handleNext}
              disabled={loading || generating}
              sx={{ width: 160 }}
            >
              {t('contextReading.next', { defaultValue: 'Вперед' })}
            </ButtonColor>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          {t('contextReading.title', { defaultValue: 'Context Reading' })}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={languageLevel}
            inputProps={{ 'aria-label': languageLevelAriaLabel }}
            onChange={(e) => setLanguageLevel(e.target.value)}
            disabled={loading || generating}
          >
            <MenuItem value="A1">A1</MenuItem>
            <MenuItem value="A2">A2</MenuItem>
            <MenuItem value="B1">B1</MenuItem>
            <MenuItem value="B2">B2</MenuItem>
            <MenuItem value="C1">C1</MenuItem>
            <MenuItem value="C2">C2</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Alert severity="info">
        {t('contextReading.waiting', { defaultValue: 'Waiting for generation to start...' })}
      </Alert>
    </Container>
  );
};

