import { Box } from '@mui/material';

import { CardLearningBack } from '@/features/card-learning-back';
import { CardLearningSideSwitcher } from '@/features/card-learning-side-switcher';
import { CardLearningProgress } from '@/features/card-learning-progress';
import { PronunciationButton } from '@/features/pronunciation-button';
import { StyledAudioBlock, StyledCardCount } from './styled-components.ts'

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
  currentText?: string;
}

export const LearningNavigation = ({
  currentIndex,
  totalCards,
  isCompleted,
  initialSide,
  onSideChange,
  disabled,
  currentText,
}: LearningNavigationProps) => {
  return (
    <Box mb={3}>
      {/* Прогресс-бар */}
        <Box sx={{mb: 4, ml: 2, mr: 2}}>
            <CardLearningProgress
                currentIndex={currentIndex}
                totalCards={totalCards}
                isCompleted={isCompleted}
            />
        </Box>

      {/* Навигация */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <CardLearningBack />

        <StyledCardCount>
          {isCompleted ? `${totalCards} / ${totalCards}` : `${currentIndex + 1} / ${totalCards}`}
        </StyledCardCount>

        <CardLearningSideSwitcher
          initialSide={initialSide}
          onSideChange={onSideChange}
          disabled={disabled || isCompleted}
        />
      </Box>

      {/* Кнопка произношения - только на стороне A */}
        {currentText && initialSide === 'question' && (
            <StyledAudioBlock>
                <PronunciationButton text={currentText} size="medium" lang="en"/>
            </StyledAudioBlock>
        )}
    </Box>
  );
};
