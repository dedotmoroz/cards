import { Button, Stack, Typography, Box } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LearningControlsProps {
  onKnow: () => void;
  onDontKnow: () => void;
  disabled?: boolean;
  learnedCount?: number;
  unlearnedCount?: number;
}

export const LearningControls = ({ onKnow, onDontKnow, disabled, learnedCount = 0, unlearnedCount = 0 }: LearningControlsProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 3 }}>
      {/* Счетчики */}
        <Box sx={{display: 'flex', justifyContent: 'center', gap: 4, mb: 2}}>

            <Box sx={{textAlign: 'center'}}>
                <Typography variant="h6" color="error.main" fontWeight="bold">
                    {unlearnedCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {t('learning.notLearned')}
                </Typography>
            </Box>

            <Box sx={{textAlign: 'center'}}>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                    {learnedCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {t('learning.learned')}
                </Typography>
            </Box>

        </Box>
      
      {/* Кнопки */}
      <Stack direction="row" spacing={2} justifyContent="center">
      <Button
        variant="contained"
        color="error"
        onClick={onDontKnow}
        disabled={disabled}
        size="large"
        startIcon={<ThumbDown />}
        sx={{ 
          minWidth: 120,
          transform: disabled ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.2s ease'
        }}
      >
        ← {t('learning.notLearned')}
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={onKnow}
        disabled={disabled}
        size="large"
        startIcon={<ThumbUp />}
        sx={{ 
          minWidth: 120,
          transform: disabled ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.2s ease'
        }}
      >
        {t('learning.learned')} →
      </Button>
      </Stack>
    </Box>
  );
};
