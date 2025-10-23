import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LearningNavigationProps {
  currentIndex: number;
  totalCards: number;
  isCompleted: boolean;
  isFirst: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  disabled?: boolean;
}

export const LearningNavigation = ({
  currentIndex,
  totalCards,
  isCompleted,
  isFirst,
  onPrevious,
  onNext,
  onBack,
  disabled
}: LearningNavigationProps) => {
  const { t } = useTranslation();
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <IconButton
        onClick={onBack}
        size="small"
      >
        {t('forms.back')}
      </IconButton>

      <Typography variant="h6">
        {isCompleted ? `${totalCards} / ${totalCards}` : `${currentIndex + 1} / ${totalCards}`}
      </Typography>

      <Box display="flex" gap={1}>
        <IconButton
          onClick={onPrevious}
          disabled={isFirst || disabled}
          size="small"
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={onNext}
          disabled={isCompleted || disabled}
          size="small"
        >
          <ArrowForward />
        </IconButton>
      </Box>
    </Box>
  );
};
