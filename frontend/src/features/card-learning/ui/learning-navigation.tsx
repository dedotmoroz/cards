import { Box, IconButton } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useTranslation } from 'react-i18next';

import { CardLearningBack } from '@/features/card-learning-back';
import { CardLearningSideSwitcher } from '@/features/card-learning-side-switcher';
import { CardLearningProgress } from '@/features/card-learning-progress';
import { PronunciationButton } from '@/features/pronunciation-button';
import { StyledAudioBlock, StyledProgressBarBox } from './styled-components.ts'

interface LearningNavigationProps {
  currentIndex: number;
  totalCards: number;
  isCompleted: boolean;
  isFirst: boolean;
  onPrevious: () => void;
  onNext: () => void;
  initialSide: 'question' | 'answer';
  onSideChange: (side: 'question' | 'answer') => void;
  disabled?: boolean;
  /** Текст стороны «вопрос» — для произношения; кнопка показывается только когда видна сторона А */
  pronunciationText?: string;
  /** Сейчас на карточке отображается сторона А (вопрос); не зависит от initialSide */
  isQuestionSideVisible?: boolean;
  onTogglePhrasesMode?: () => void;
  /** Режим контекста включён */
  phrasesMode?: boolean;
  /** У текущей карточки есть контекстные фразы (переход в режим контекста возможен только при true) */
  hasPhrasesForCurrentCard?: boolean;
}

export const LearningNavigation = ({
  currentIndex,
  totalCards,
  isCompleted,
  initialSide,
  onSideChange,
  disabled,
  pronunciationText,
  isQuestionSideVisible = false,
  onTogglePhrasesMode,
  phrasesMode = false,
  hasPhrasesForCurrentCard = false,
}: LearningNavigationProps) => {
  const { t } = useTranslation();
  // В режиме карточек — disabled, если нет контекста; в режиме контекста — переключение всегда доступно
  const phrasesToggleDisabled = disabled || isCompleted || (!phrasesMode && !hasPhrasesForCurrentCard);
  const showNoPhrasesTitle = !phrasesMode && !hasPhrasesForCurrentCard;

  return (
    <>
      {/* Прогресс-бар */}
        <StyledProgressBarBox>
            <CardLearningProgress
                currentIndex={currentIndex}
                totalCards={totalCards}
                isCompleted={isCompleted}
            />
        </StyledProgressBarBox>

      {/* Навигация */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <CardLearningBack />

        <Box display="flex" alignItems="center" gap={3}>
          {onTogglePhrasesMode && (
            <IconButton
              size="small"
              onClick={onTogglePhrasesMode}
              disabled={phrasesToggleDisabled}
              aria-label={t('cards.switchMode', 'Переключить режим')}
              title={showNoPhrasesTitle ? t('cards.noPhrasesForCard', 'Нет контекстных фраз для этой карточки') : undefined}
            >
              <SwapVertIcon />
            </IconButton>
          )}
          <CardLearningSideSwitcher
            initialSide={initialSide}
            onSideChange={onSideChange}
            disabled={disabled || isCompleted}
          />
        </Box>
      </Box>


        {isQuestionSideVisible && pronunciationText && (
            <StyledAudioBlock>
                <PronunciationButton text={pronunciationText} size="medium" lang="en"/>
            </StyledAudioBlock>
        )}
    </>
  );
};
