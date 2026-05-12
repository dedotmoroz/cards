import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
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
const CONTEXT_READING_ACTIVE_CHIP_BG = '#3900ff26';
const CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX = { fontSize: { xs: '28px' } };

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightPhraseInText = (source: string, phrase: string | null): ReactNode => {
  const trimmed = phrase?.trim();
  if (!trimmed) {
    return source;
  }
  try {
    const re = new RegExp(escapeRegExp(trimmed), 'gi');
    const fragments: ReactNode[] = [];
    let lastAppend = 0;
    let key = 0;
    let firstHitMarked = false;
    let match: RegExpExecArray | null;

    while ((match = re.exec(source)) !== null) {
      const token = match[0];
      if (token.length === 0 || match.index < lastAppend) {
        break;
      }
      if (lastAppend < match.index) {
        fragments.push(source.slice(lastAppend, match.index));
      }

      const isFirst = !firstHitMarked;
      firstHitMarked = true;
      fragments.push(
        <Box
          component="mark"
          key={`hl-${match.index}-${key}`}
          data-context-reading-hit={isFirst ? 'true' : undefined}
          sx={{
              bgcolor: 'transparent',
              color: 'text.primary',
              px: 0.25,
              borderRadius: 0.5,
              ml: '-2px',
              mr: '-2px',
              borderBottom: '4px solid #3900ff47',
          }}
        >
          {token}
        </Box>,
      );

      lastAppend = match.index + token.length;
      key += 1;
    }

    if (lastAppend < source.length) {
      fragments.push(source.slice(lastAppend));
    }

    return fragments.length === 1 && typeof fragments[0] === 'string' ? fragments[0] : fragments;
  } catch {
    return source;
  }
};

export const ContextReadingPage = () => {
  const { t, i18n } = useTranslation();
  const { userId, folderId } = useParams<{ userId?: string; folderId?: string }>();
  const navigate = useNavigate();
  const learnFolderPath = userId && folderId ? `/learn/${userId}/${folderId}` : undefined;
  const languageLevelAriaLabel = t('contextReading.languageLevel', { defaultValue: 'Language level' });
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ContextReadingGenerateStatusResponse | null>(null);
  const [currentCards, setCurrentCards] = useState<Array<{ question: string; answer: string }>>([]);
  const [progress, setProgress] = useState<{ used: number; total: number } | null>(null);
  const [languageLevel, setLanguageLevel] = useState<string>('B1');
  const [highlightedChipIndex, setHighlightedChipIndex] = useState<number | null>(null);

  const generatedTextBlockRef = useRef<HTMLDivElement>(null);

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
      setHighlightedChipIndex(null);

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

  // Обработчик кнопки "Сброс" — сброс прогресса и возврат к форме выбора уровня / создания контента
  const handleReset = async () => {
    if (!folderId) return;

    try {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }

      setLoading(true);
      setGenerating(false);
      setError(null);
      setStatus(null);
      setCurrentCards([]);
      setProgress(null);
      setHighlightedChipIndex(null);
      lastProcessedKeyRef.current = null;

      await contextReadingApi.resetProgress(folderId);
      setLoading(false);
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
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    if (!folderId) {
      setLoading(false);
      setGenerating(false);
      setError(null);
      setStatus(null);
      setCurrentCards([]);
      setProgress(null);
      setHighlightedChipIndex(null);
      lastProcessedKeyRef.current = null;
      return;
    }

    setLoading(false);
    setGenerating(false);
    setError(null);
    setStatus(null);
    setCurrentCards([]);
    setProgress(null);
    setHighlightedChipIndex(null);
    lastProcessedKeyRef.current = null;

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [folderId, i18n.language]);

  const handleCreateContent = async () => {
    if (!folderId) return;

    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    try {
      await contextReadingApi.resetProgress(folderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset progress');
      return;
    }

    const currentKey = `${folderId}-${i18n.language}`;
    lastProcessedKeyRef.current = currentKey;
    await startGeneration();
  };

  useEffect(() => {
    if (highlightedChipIndex === null) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      generatedTextBlockRef.current?.querySelector<HTMLElement>('[data-context-reading-hit="true"]')?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [highlightedChipIndex]);

  if (!folderId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
          {t('contextReading.title', { defaultValue: 'Context Reading' })}
        </Typography>
        <Alert severity="error">{t('contextReading.folderRequired', { defaultValue: 'Folder ID is required' })}</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} disabled />}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ ml: { xs: 2, sm: 4 }, ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
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
          <Typography variant="h4" sx={{ ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
        </Box>
        {isNoCardsError ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.primary' }}>
              {t('contextReading.noWordsLeft', {
                defaultValue: 'Слова для создания контента в этой папке закончились.',
              })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>

                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
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

                    <ButtonColor onClick={handleCreateContent} disabled={loading || generating} sx={{minWidth: 200}}>
                        {t('contextReading.createContent', {defaultValue: 'Create content'})}
                    </ButtonColor>
                </Box>
                {learnFolderPath && (
                    <ButtonLink
                        onClick={() => navigate(learnFolderPath)}
                        disabled={loading || generating}
                        sx={{ minWidth: 200 }}
                    >
                        {t('contextReading.backToFolder', { defaultValue: 'Вернуться в папку' })}
                    </ButtonLink>
                )}
            </Box>
          </Box>
        ) : (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            {folderId && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ButtonColor onClick={handleCreateContent} disabled={loading || generating} sx={{ minWidth: 220 }}>
                  {t('contextReading.createContent', { defaultValue: 'Create content' })}
                </ButtonColor>
              </Box>
            )}
          </>
        )}
      </Container>
    );
  }

  // Показываем процесс генерации (первый ответ статуса может прийти с задержкой)
  if (generating) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} disabled />}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ ml: { xs: 2, sm: 4 }, ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
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
            {t('contextReading.generating', { defaultValue: 'Generating text...' })}
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
          <Typography variant="h4" sx={{ ml: { xs: 2, sm: 4 }, ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
            {t('contextReading.title', { defaultValue: 'Context Reading' })}
          </Typography>
        </Box>
        
        {/* Список слов */}
        {currentCards.length > 0 && (
          <Box sx={{ mt: 2, mb: 3, pl: { xs: 0, sm: 4 } }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentCards.map((card, index) => (
                <Chip
                  key={index}
                  size="small"
                  clickable
                  aria-pressed={highlightedChipIndex === index}
                  color="default"
                  variant={highlightedChipIndex === index ? 'filled' : 'outlined'}
                  sx={
                    highlightedChipIndex === index
                      ? {
                          bgcolor: CONTEXT_READING_ACTIVE_CHIP_BG,
                          '&:hover': { bgcolor: CONTEXT_READING_ACTIVE_CHIP_BG },
                          '&:active': { bgcolor: CONTEXT_READING_ACTIVE_CHIP_BG },
                        }
                      : undefined
                  }
                  onClick={() =>
                    setHighlightedChipIndex(prev => (prev === index ? null : index))
                  }
                  label={
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography variant="body2" component="span" fontWeight="medium">
                        {card.question}
                      </Typography>
                      <Typography variant="body2" component="span">
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
              <Typography variant="h6" component="span" sx={{ ml: { xs: 0, sm: 2 } }}>
                {t('contextReading.text', { defaultValue: 'Text' })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                ref={generatedTextBlockRef}
                component="div"
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  p: { xs: 0, sm: 2 },
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  width: '100%',
                  boxSizing: 'border-box',
                  mt: { xs: -1, sm: -3 },
                }}
              >
                {highlightPhraseInText(
                  status.result.text,
                  highlightedChipIndex === null
                    ? null
                    : (currentCards[highlightedChipIndex]?.question ?? null),
                )}
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
              <Typography variant="h6" component="span" sx={{ ml: { xs: 0, sm: 2 } }}>
                {t('contextReading.translation', { defaultValue: 'Translation' })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  p: { xs: 0, sm: 2 },
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  width: '100%',
                  boxSizing: 'border-box',
                  mt: { xs: -1, sm: -3 },
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
            <Typography variant="body1" color="text.secondary" sx={{ ml: { xs: 2, sm: 4 } }}>
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
        <Typography variant="h4" sx={{ ml: { xs: 2, sm: 4 }, ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
          {t('contextReading.title', { defaultValue: 'Context Reading' })}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
            ml: { xs: 2, sm: 4 },
            mt: 4,
        }}
      >
          <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
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
              <ButtonColor onClick={handleCreateContent} disabled={loading || generating} sx={{minWidth: 220}}>
                  {t('contextReading.createContent', {defaultValue: 'Create content'})}
              </ButtonColor>
          </Box>
      </Box>
    </Container>
  );
};

