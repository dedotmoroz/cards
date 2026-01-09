import { Stack, Box } from '@mui/material';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { useTranslation } from 'react-i18next';
import { StyledDontKnowButton, StyledKnowButton, StyledUnlearnedCount, StyledLearnedCount } from './styled-components';

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
            <Box>
                <StyledUnlearnedCount variant="h4">
                    {unlearnedCount}
                </StyledUnlearnedCount>
            </Box>
            <Box>
                <StyledLearnedCount variant="h4">
                    {learnedCount}
                </StyledLearnedCount>
            </Box>
        </Box>
      
      {/* Кнопки */}
      <Stack direction="row" spacing={2} justifyContent="center">
      <StyledDontKnowButton
        variant="contained"
        color="error"
        onClick={onDontKnow}
        disabled={disabled}
        size="large"
        startIcon={<ThumbDownOutlinedIcon />}
      >
        {t('learning.notLearned')}
      </StyledDontKnowButton>
      <StyledKnowButton
        variant="contained"
        color="success"
        onClick={onKnow}
        disabled={disabled}
        size="large"
        endIcon={<ThumbUpOutlinedIcon />}
      >
        {t('learning.learned')}
      </StyledKnowButton>
      </Stack>
    </Box>
  );
};
