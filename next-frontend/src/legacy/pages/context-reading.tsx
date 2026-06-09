import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { contextReadingApi, type ContextReadingGenerateStatusResponse } from '@/shared/api/contextReadingApi';
import { cardsApi } from '@/shared/api/cardsApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { ContextReadingContextLoading } from '@/widgets/context-reading/context-loading';
import { ContextReadingContextError } from '@/widgets/context-reading/context-error';
import { ContextReadingContentOutput } from '@/widgets/context-reading/content-output';
import {
  ContextReadingContentStart,
  type ContextReadingFolderCard,
} from '@/widgets/context-reading/content-start';

const POLLING_INTERVAL = 2000; // 2 seconds
const CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX = { fontSize: { xs: '28px' } };

export const ContextReadingPage = () => {
  const { t, i18n } = useTranslation();
  const { userId, folderId } = useParams<{ userId?: string; folderId?: string }>();
  const learnFolderPath = userId && folderId ? `/learn/${userId}/${folderId}` : undefined;
  const contextReadingPath =
    userId && folderId ? `/learn/${userId}/${folderId}/context-reading` : undefined;

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ContextReadingGenerateStatusResponse | null>(null);
  const [currentCards, setCurrentCards] = useState<Array<{ question: string; answer: string }>>([]);
  const [progress, setProgress] = useState<{ used: number; total: number } | null>(null);
  const [languageLevel, setLanguageLevel] = useState<string>('B1');
  const [highlightedChipIndex, setHighlightedChipIndex] = useState<number | null>(null);
  const [folderCards, setFolderCards] = useState<ContextReadingFolderCard[]>([]);
  const [folderCardsLoading, setFolderCardsLoading] = useState(false);
  /** false = все карточки папки; true = только невыученные (режим фиксируется до сброса). */
  const [onlyUnlearnedWords, setOnlyUnlearnedWords] = useState(false);

  const generatedTextBlockRef = useRef<HTMLDivElement>(null);

  // Используем ref для предотвращения повторных вызовов
  const lastProcessedKeyRef = useRef<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useSEO({
    title: t('seo.contextReading.title', { defaultValue: 'Context' }),
    description: t('seo.contextReading.description', { defaultValue: 'Read context with cards' }),
    keywords: t('seo.keywords'),
    lang: i18n.language,
  });

  const loadFolderCards = useCallback(async () => {
    if (!folderId) {
      setFolderCards([]);
      return;
    }

    setFolderCardsLoading(true);
    try {
      const cards = await cardsApi.getCards(folderId);
      const sorted = [...cards].sort((a, b) => {
        if (a.isLearned !== b.isLearned) {
          return a.isLearned ? 1 : -1;
        }
        return a.question.localeCompare(b.question, undefined, { sensitivity: 'base' });
      });
      setFolderCards(
        sorted.map(card => ({
          id: card.id,
          question: card.question,
          answer: card.answer,
          isLearned: card.isLearned,
        })),
      );
    } catch {
      setFolderCards([]);
    } finally {
      setFolderCardsLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    void loadFolderCards();
  }, [loadFolderCards]);

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
      const nextCardsResponse = await contextReadingApi.getNextCards(folderId, 5, onlyUnlearnedWords);
      
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

      const generateResponse = await contextReadingApi.generateText({
        cardIds,
        level: languageLevel,
      });

      setGenerating(true);
      setLoading(false);

      // 3. Начинаем опрос статуса
      const pollStatus = async (jobId: string) => {
        const poll = async (): Promise<void> => {
          // Проверяем, не изменился ли ключ (folderId или language)
          const currentKey = `${folderId}-${i18n.language}-${onlyUnlearnedWords}`;
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

  const handleBackToStart = async () => {
    if (!folderId) return;

    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    setLoading(false);
    setGenerating(false);
    setError(null);
    setStatus(null);
    setCurrentCards([]);
    setProgress(null);
    setHighlightedChipIndex(null);
    lastProcessedKeyRef.current = null;

    try {
      await contextReadingApi.resetProgress(folderId);
      void loadFolderCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset progress');
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
      void loadFolderCards();
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
      const currentKey = `${folderId}-${i18n.language}-${onlyUnlearnedWords}`;
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
      setOnlyUnlearnedWords(false);
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
    setOnlyUnlearnedWords(false);

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

    const currentKey = `${folderId}-${i18n.language}-${onlyUnlearnedWords}`;
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
          {t('contextReading.title', { defaultValue: 'Context' })}
        </Typography>
        <Alert severity="error">{t('contextReading.folderRequired', { defaultValue: 'Folder ID is required' })}</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <ContextReadingContextError
        error={error}
        learnFolderPath={learnFolderPath}
        contextReadingPath={contextReadingPath}
        onBackToStart={handleBackToStart}
        loading={loading}
        generating={generating}
      />
    );
  }

  // Показываем процесс генерации (первый ответ статуса может прийти с задержкой)
  if (generating || loading) {
    return <ContextReadingContextLoading learnFolderPath={learnFolderPath} />;
  }

  // Показываем результат с кнопками
  if (status?.state === 'completed' && status.result) {
    return (
      <ContextReadingContentOutput
        learnFolderPath={learnFolderPath}
        currentCards={currentCards}
        highlightedChipIndex={highlightedChipIndex}
        onChipClick={index => setHighlightedChipIndex(prev => (prev === index ? null : index))}
        text={status.result.text}
        translation={status.result.translation}
        progress={progress}
        generatedTextBlockRef={generatedTextBlockRef}
        onReset={handleReset}
        onNext={handleNext}
        loading={loading}
        generating={generating}
      />
    );
  }

  return (
    <ContextReadingContentStart
      learnFolderPath={learnFolderPath}
      folderCards={folderCards}
      folderCardsLoading={folderCardsLoading}
      onlyUnlearnedWords={onlyUnlearnedWords}
      onOnlyUnlearnedWordsChange={setOnlyUnlearnedWords}
      languageLevel={languageLevel}
      onLanguageLevelChange={setLanguageLevel}
      onCreateContent={handleCreateContent}
      loading={loading}
      generating={generating}
    />
  );
};

