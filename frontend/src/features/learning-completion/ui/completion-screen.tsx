import { Box, Typography, Button, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CompletionScreenProps {
  onBackToFolders: () => void;
  onContinueLearning?: () => void;
  hasUnlearnedCards?: boolean;
  unlearnedCount?: number;
  learnedCount?: number;
}

export const CompletionScreen = ({ 
  onBackToFolders, 
  onContinueLearning, 
  hasUnlearnedCards,
  unlearnedCount = 0,
  learnedCount = 0
}: CompletionScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const totalCards = learnedCount + unlearnedCount;
  const learnedPercentage = totalCards > 0 ? Math.round((learnedCount / totalCards) * 100) : 0;
  const learnedAngle = (learnedPercentage / 100) * 360;

  const progressBackground = `conic-gradient(${theme.palette.success.main} 0deg ${learnedAngle}deg, ${theme.palette.error.main} ${learnedAngle}deg 360deg)`;

  return (
    <Box textAlign="center" mt={4}>
        {!unlearnedCount
            ?
            (<Typography variant="h6" gutterBottom>
                {t('learning.allLearned')}
            </Typography>)
            :
            (<Typography variant="h6" gutterBottom>
                {t('learning.completedCycle')}
            </Typography>)
        }

      <Box
        sx={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: progressBackground,
          mx: 'auto',
          mt: 4,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: `0 0 0 1px ${theme.palette.divider}`
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {learnedPercentage}%
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'success.main' }} />
          <Typography variant="body2">
            {t('learning.learned')}: {learnedCount}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'error.main' }} />
          <Typography variant="body2">
            {t('learning.notLearned')}: {unlearnedCount}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          {!unlearnedCount && (
              <Button
                  variant="outlined"
                  onClick={onBackToFolders}
              >
                  {t('forms.back')}
              </Button>
          )}
          {hasUnlearnedCards && onContinueLearning && (
              <Button
                  variant="contained"
                  onClick={onContinueLearning}
              >
                  {t('forms.continueWithCount', {count: unlearnedCount})}
              </Button>
          )}
      </Stack>
    </Box>
  );
};
