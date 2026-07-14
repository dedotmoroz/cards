import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  contextReadingApi,
  type ContextReadingArtifact,
  type ContextReadingGenerateStatusResponse,
} from '@/shared/api/contextReadingApi';
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ContextReadingGenerateStatusResponse | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentCards, setCurrentCards] = useState<Array<{ question: string; answer: string }>>([]);
  const [progress, setProgress] = useState<{ used: number; total: number } | null>(null);
  const [languageLevel, setLanguageLevel] = useState<string>('B1');
  const [highlightedChipIndex, setHighlightedChipIndex] = useState<number | null>(null);
  const [folderCards, setFolderCards] = useState<ContextReadingFolderCard[]>([]);
  const [folderCardsLoading, setFolderCardsLoading] = useState(false);
  /** false = все карточки папки; true = только невыученные (режим фиксируется до сброса). */
  const [onlyUnlearnedWords, setOnlyUnlearnedWords] = useState(false);
  const [artifacts, setArtifacts] = useState<ContextReadingArtifact[]>([]);
  const [artifactIndex, setArtifactIndex] = useState(0);
  const [showStart, setShowStart] = useState(false);

  const generatedTextBlockRef = useRef<HTMLDivElement>(null);

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

  const applyArtifactAt = useCallback((list: ContextReadingArtifact[], index: number) => {
    const next = list[index];
    if (!next) return;
    setArtifacts(list);
    setArtifactIndex(index);
    setCurrentCards(next.cardsSnapshot);
    setLanguageLevel(next.level);
    setStatus({
      id: next.jobId,
      state: 'completed',
      progress: 100,
      result: {
        text: next.text,
        translation: next.translation,
        hasAudio: next.hasAudio,
      },
      queueType: 'context',
    });
    setCurrentJobId(next.jobId);
    setShowStart(false);
  }, []);

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
      setCurrentJobId(null);
      setHighlightedChipIndex(null);
      setShowStart(false);

      const nextCardsResponse = await contextReadingApi.getNextCards(folderId, 5, onlyUnlearnedWords);

      if (nextCardsResponse.completed || nextCardsResponse.cards.length === 0) {
        setError('No cards available for context reading');
        setLoading(false);
        return;
      }

      setCurrentCards(nextCardsResponse.cards.map(card => ({
        question: card.question,
        answer: card.answer,
      })));

      setProgress(nextCardsResponse.progress);

      const cardIds = nextCardsResponse.cards.map(card => card.id);

      const generateResponse = await contextReadingApi.generateText({
        cardIds,
        level: languageLevel,
      });

      setCurrentJobId(generateResponse.jobId);
      setGenerating(true);
      setLoading(false);

      const pollStatus = async (jobId: string) => {
        const poll = async (): Promise<void> => {
          const currentKey = `${folderId}-${i18n.language}-${onlyUnlearnedWords}`;
          if (lastProcessedKeyRef.current !== currentKey) {
            return;
          }

          try {
            const statusResponse = await contextReadingApi.getGenerateStatus(jobId);
            setStatus(statusResponse);

            if (statusResponse.state === 'completed') {
              try {
                const saved = await contextReadingApi.persist({
                  jobId,
                  folderId,
                  cardIds,
                  level: languageLevel,
                });
                const list = await contextReadingApi.getHistory(folderId);
                const index = list.findIndex(a => a.id === saved.id);
                applyArtifactAt(list, index >= 0 ? index : Math.max(0, list.length - 1));
              } catch (persistError) {
                setError(
                  persistError instanceof Error
                    ? persistError.message
                    : 'Failed to save context',
                );
              } finally {
                setGenerating(false);
              }
              return;
            }

            if (statusResponse.state === 'failed') {
              setGenerating(false);
              setError(statusResponse.error || 'Generation failed');
              return;
            }

            pollingTimeoutRef.current = setTimeout(poll, POLLING_INTERVAL);
          } catch (err) {
            setGenerating(false);
            setError(err instanceof Error ? err.message : 'Failed to fetch status');
          }
        };

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
    setCurrentJobId(null);
    setCurrentCards([]);
    setProgress(null);
    setHighlightedChipIndex(null);
    lastProcessedKeyRef.current = null;
    setShowStart(true);

    try {
      await contextReadingApi.resetProgress(folderId);
      void loadFolderCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset progress');
    }
  };

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
      setCurrentJobId(null);
      setCurrentCards([]);
      setProgress(null);
      setHighlightedChipIndex(null);
      lastProcessedKeyRef.current = null;
      setShowStart(true);

      await contextReadingApi.resetProgress(folderId);
      setLoading(false);
      void loadFolderCards();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to reset progress');
    }
  };

  const handleNext = async () => {
    if (!folderId) return;

    try {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }

      if (artifactIndex < artifacts.length - 1) {
        applyArtifactAt(artifacts, artifactIndex + 1);
        return;
      }

      const currentKey = `${folderId}-${i18n.language}-${onlyUnlearnedWords}`;
      lastProcessedKeyRef.current = currentKey;
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
      setInitialLoading(false);
      setGenerating(false);
      setError(null);
      setStatus(null);
      setCurrentJobId(null);
      setCurrentCards([]);
      setProgress(null);
      setHighlightedChipIndex(null);
      setArtifacts([]);
      setArtifactIndex(0);
      setShowStart(false);
      lastProcessedKeyRef.current = null;
      setOnlyUnlearnedWords(false);
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      setInitialLoading(true);
      setLoading(false);
      setGenerating(false);
      setError(null);
      setStatus(null);
      setCurrentJobId(null);
      setCurrentCards([]);
      setProgress(null);
      setHighlightedChipIndex(null);
      setArtifacts([]);
      setArtifactIndex(0);
      setShowStart(false);
      lastProcessedKeyRef.current = null;
      setOnlyUnlearnedWords(false);

      try {
        const list = await contextReadingApi.getHistory(folderId);
        if (cancelled) return;
        if (list.length > 0) {
          applyArtifactAt(list, 0);
        } else {
          setShowStart(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load saved context');
          setShowStart(true);
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [folderId, i18n.language, applyArtifactAt]);

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

  const handleOpenHistory = () => {
    if (artifacts.length === 0) return;
    applyArtifactAt(artifacts, 0);
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
    return () => window.cancelAnimationFrame(frame);
  }, [highlightedChipIndex]);

  const currentArtifact = artifacts[artifactIndex] ?? null;

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

  if (initialLoading || generating || loading) {
    return <ContextReadingContextLoading learnFolderPath={learnFolderPath} />;
  }

  if (!showStart && status?.state === 'completed' && status.result) {
    return (
      <ContextReadingContentOutput
        learnFolderPath={learnFolderPath}
        currentCards={currentCards}
        highlightedChipIndex={highlightedChipIndex}
        onChipClick={index => setHighlightedChipIndex(prev => (prev === index ? null : index))}
        text={status.result.text}
        translation={status.result.translation}
        jobId={currentArtifact ? null : currentJobId}
        artifactId={currentArtifact?.id ?? null}
        hasAudio={status.result.hasAudio}
        progress={progress}
        historyProgress={
          artifacts.length > 0
            ? { current: artifactIndex + 1, total: artifacts.length }
            : null
        }
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
      hasLatest={artifacts.length > 0}
      onOpenLatest={handleOpenHistory}
      loading={loading}
      generating={generating}
    />
  );
};
