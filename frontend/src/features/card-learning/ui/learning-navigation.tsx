import { Box, Typography } from '@mui/material';

import { CardLearningBack } from '@/features/card-learning-back';

interface LearningNavigationProps {
  currentIndex: number;
  totalCards: number;
  isCompleted: boolean;
  isFirst: boolean;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const LearningNavigation = ({
  currentIndex,
  totalCards,
  isCompleted,
}: LearningNavigationProps) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <CardLearningBack />

      <Typography variant="h6">
        {isCompleted ? `${totalCards} / ${totalCards}` : `${currentIndex + 1} / ${totalCards}`}
      </Typography>

      {/*<Box display="flex" gap={1}>*/}
      {/*  <IconButton*/}
      {/*    onClick={onPrevious}*/}
      {/*    disabled={isFirst || disabled}*/}
      {/*    size="small"*/}
      {/*  >*/}
      {/*    <ArrowBack />*/}
      {/*  </IconButton>*/}
      {/*  <IconButton*/}
      {/*    onClick={onNext}*/}
      {/*    disabled={isCompleted || disabled}*/}
      {/*    size="small"*/}
      {/*  >*/}
      {/*    <ArrowForward />*/}
      {/*  </IconButton>*/}
      {/*</Box>*/}
    </Box>
  );
};
