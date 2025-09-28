import { Box, Typography, Button, Stack } from '@mui/material';

interface CompletionScreenProps {
  onBackToFolders: () => void;
  onContinueLearning?: () => void;
  hasUnlearnedCards?: boolean;
}

export const CompletionScreen = ({ 
  onBackToFolders, 
  onContinueLearning, 
  hasUnlearnedCards 
}: CompletionScreenProps) => {
  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h6" gutterBottom>
        🎉 Вы изучили все карточки в этой папке!
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBackToFolders}
        >
          Вернуться к папкам
        </Button>
        {hasUnlearnedCards && onContinueLearning && (
          <Button
            variant="contained"
            onClick={onContinueLearning}
          >
            Продолжить изучение
          </Button>
        )}
      </Stack>
    </Box>
  );
};
