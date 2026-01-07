import { Box, Typography } from '@mui/material';

import { CardLearningBack } from '@/features/card-learning-back';
import { CardLearningSideSwitcher } from '@/features/card-learning-side-switcher';
import { CardLearningProgress } from '@/features/card-learning-progress';

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
}

export const LearningNavigation = ({
  currentIndex,
  totalCards,
  isCompleted,
  initialSide,
  onSideChange,
  disabled,
}: LearningNavigationProps) => {
  return (
    <Box mb={3}>
      {/* Прогресс-бар */}
      <CardLearningProgress
        currentIndex={currentIndex}
        totalCards={totalCards}
        isCompleted={isCompleted}
      />

      {/* Навигация */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <CardLearningBack />

        <Typography variant="h6">
          {isCompleted ? `${totalCards} / ${totalCards}` : `${currentIndex + 1} / ${totalCards}`}
        </Typography>

        <CardLearningSideSwitcher
          initialSide={initialSide}
          onSideChange={onSideChange}
          disabled={disabled || isCompleted}
        />
      </Box>
    </Box>
  );
};
