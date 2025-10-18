import { Button, Stack } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';

interface LearningControlsProps {
  onKnow: () => void;
  onDontKnow: () => void;
  onFlip: () => void;
  disabled?: boolean;
}

export const LearningControls = ({ onKnow, onDontKnow, disabled }: LearningControlsProps) => {
  return (
    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
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
        ← Не знаю
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
        Знаю →
      </Button>
    </Stack>
  );
};
