import { Box, Typography, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h6" gutterBottom>
        🎉 {t('learning.allLearned')}
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBackToFolders}
        >
          {t('forms.back')}
        </Button>
        {hasUnlearnedCards && onContinueLearning && (
          <Button
            variant="contained"
            onClick={onContinueLearning}
          >
            {t('forms.continue')}
          </Button>
        )}
      </Stack>
    </Box>
  );
};
