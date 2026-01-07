import { Box, LinearProgress } from '@mui/material';

interface CardLearningProgressProps {
  currentIndex: number;
  totalCards: number;
  isCompleted: boolean;
}

export const CardLearningProgress = ({
  currentIndex,
  totalCards,
  isCompleted,
}: CardLearningProgressProps) => {
  // Вычисляем прогресс: сколько карточек пройдено
  // currentIndex - это индекс текущей карточки (0-based)
  // Если currentIndex = 0 и totalCards = 10, то мы на первой карточке, прогресс = 1/10 = 10%
  // Если currentIndex = 4 и totalCards = 10, то мы на 5-й карточке, прогресс = 5/10 = 50%
  // Если isCompleted = true, то все карточки пройдены, прогресс = 100%
  const progress = totalCards > 0 
    ? (isCompleted 
        ? 100 
        : ((currentIndex + 1) / totalCards) * 100)
    : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <LinearProgress 
        variant="determinate" 
        value={Math.min(progress, 100)} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          }
        }} 
      />
    </Box>
  );
};

