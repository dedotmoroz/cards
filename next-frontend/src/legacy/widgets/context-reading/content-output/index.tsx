import { useEffect, useRef, useState } from 'react';
import type { RefObject, ReactNode } from 'react';
import { Box, Typography, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import { ExpandMore, GraphicEq } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import { ContextReadingAudioPlayer } from '@/widgets/context-reading/context-audio-player';
import { contextReadingApi } from '@/shared/api/contextReadingApi';
import { ButtonBlack } from '@/shared/ui/button-black';
import {
  StyledContainerWrapper,
  StyledHeaderRow,
  StyledPageTitle,
  StyledChipsSection,
  StyledChipsRow,
  StyledContextWordChip,
  StyledChipLabelRow,
  StyledAccordionsStack,
  StyledContentAccordion,
  StyledAccordionSectionTitle,
  StyledAccordionBodyText,
  StyledFooterRow,
  StyledProgressText,
  StyledFooterActions,
  StyledResetButton,
  StyledNextButton,
  StyledHighlightMark,
} from './styled-components';

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
        <StyledHighlightMark
          key={`hl-${match.index}-${key}`}
          data-context-reading-hit={isFirst ? 'true' : undefined}
        >
          {token}
        </StyledHighlightMark>,
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

export type ContextReadingCardLine = { question: string; answer: string };

export type ContextReadingContentOutputProps = {
  learnFolderPath?: string;
  currentCards: ContextReadingCardLine[];
  highlightedChipIndex: number | null;
  onChipClick: (index: number) => void;
  text: string;
  translation: string;
  jobId?: string | null;
  artifactId?: string | null;
  hasAudio?: boolean;
  progress: { used: number; total: number } | null;
  historyProgress?: { current: number; total: number } | null;
  generatedTextBlockRef: RefObject<HTMLDivElement | null>;
  onReset: () => void;
  onNext: () => void;
  loading: boolean;
  generating: boolean;
};

export const ContextReadingContentOutput = ({
  learnFolderPath,
  currentCards,
  highlightedChipIndex,
  onChipClick,
  text,
  translation,
  jobId,
  artifactId,
  hasAudio,
  progress,
  historyProgress,
  generatedTextBlockRef,
  onReset,
  onNext,
  loading,
  generating,
}: ContextReadingContentOutputProps) => {
  const { t } = useTranslation();

  const [audioExists, setAudioExists] = useState<boolean>(Boolean(hasAudio));
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRequestSeqRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setAudioError(null);
      if (!jobId && !artifactId) {
        setAudioExists(false);
        return;
      }

      try {
        const res = await contextReadingApi.getAudioExists({
          jobId: artifactId ? undefined : jobId ?? undefined,
          artifactId: artifactId ?? undefined,
        });
        if (!cancelled) {
          setAudioExists(Boolean(res.hasAudio));
        }
      } catch {
        if (!cancelled) {
          setAudioExists(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [jobId, artifactId]);

  const handleCreateAudio = async () => {
    if (!jobId || audioGenerating) return;

    setAudioError(null);
    const seq = ++audioRequestSeqRef.current;
    setAudioGenerating(true);
    try {
      const res = await contextReadingApi.generateAudio({
        jobId,
        artifactId: artifactId ?? undefined,
      });
      if (audioRequestSeqRef.current === seq) {
        setAudioExists(Boolean(res.hasAudio));
      }
    } catch (err) {
      if (audioRequestSeqRef.current === seq) {
        setAudioError(err instanceof Error ? err.message : 'Failed to generate audio');
        setAudioExists(false);
      }
    } finally {
      if (audioRequestSeqRef.current === seq) {
        setAudioGenerating(false);
      }
    }
  };

  return (
    <StyledContainerWrapper maxWidth="md">
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}
      <StyledHeaderRow>
        <StyledPageTitle>
          {t('contextReading.title')}
        </StyledPageTitle>
      </StyledHeaderRow>

      {currentCards.length > 0 && (
        <StyledChipsSection>
          <StyledChipsRow>
            {currentCards.map((card, index) => (
              <StyledContextWordChip
                key={index}
                size="small"
                clickable
                aria-pressed={highlightedChipIndex === index}
                color="default"
                variant={highlightedChipIndex === index ? 'filled' : 'outlined'}
                onClick={() => onChipClick(index)}
                label={
                  <StyledChipLabelRow component="span">
                    <Typography variant="body2" component="span" fontWeight="medium">
                      {card.question}
                    </Typography>
                    <Typography variant="body2" component="span">
                      ({card.answer})
                    </Typography>
                  </StyledChipLabelRow>
                }
              />
            ))}
          </StyledChipsRow>
        </StyledChipsSection>
      )}

      <StyledAccordionsStack>
        <StyledContentAccordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 1 }}>
              <StyledAccordionSectionTitle variant="h6" component="span">
                {t('contextReading.text')}
              </StyledAccordionSectionTitle>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAccordionBodyText
              ref={generatedTextBlockRef}
              component="div"
            >
              {highlightPhraseInText(
                text,
                highlightedChipIndex === null ? null : (currentCards[highlightedChipIndex]?.question ?? null),
              )}
            </StyledAccordionBodyText>
            <Box
              sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}
              onClick={(event) => event.stopPropagation()}
              onFocus={(event) => event.stopPropagation()}
            >
              {audioExists ? (
                <ContextReadingAudioPlayer
                  jobId={jobId}
                  artifactId={artifactId}
                  hasAudio={true}
                  disabled={loading || generating || audioGenerating}
                />
              ) : (
                <ButtonBlack
                  disabled={audioGenerating || loading || generating || !jobId}
                  title={audioError ?? undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleCreateAudio();
                  }}
                  startIcon={
                    audioGenerating ? <CircularProgress size={16} color="inherit" /> : <GraphicEq />
                  }
                >
                  {t('contextReading.createAudio', { defaultValue: 'Создать аудио' })}
                </ButtonBlack>
              )}
            </Box>
          </AccordionDetails>
        </StyledContentAccordion>

        <StyledContentAccordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <StyledAccordionSectionTitle variant="h6" component="span">
              {t('contextReading.translation')}
            </StyledAccordionSectionTitle>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAccordionBodyText variant="body1">{translation}</StyledAccordionBodyText>
          </AccordionDetails>
        </StyledContentAccordion>
      </StyledAccordionsStack>

      <StyledFooterRow>
        <StyledFooterActions>
            <StyledResetButton onClick={onReset} disabled={loading || generating}>
                {t('contextReading.reset')}
            </StyledResetButton>
            {historyProgress && (
                <StyledProgressText>
                    {t('contextReading.historyProgress', {
                        current: historyProgress.current,
                        total: historyProgress.total,
                        defaultValue: '{{current}}/{{total}} saved',
                    })}
                </StyledProgressText>
            )}
            {progress && (
                <StyledProgressText>
                    {t('contextReading.progress', {
                        used: progress.used,
                        total: progress.total,
                        remaining: progress.total - progress.used,
                    })}
                </StyledProgressText>
            )}
        </StyledFooterActions>
          <StyledNextButton onClick={onNext} disabled={loading || generating}>
            {t('contextReading.next')}
          </StyledNextButton>
      </StyledFooterRow>

    </StyledContainerWrapper>
  );
};
