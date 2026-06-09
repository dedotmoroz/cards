import { Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
    StyledContainer,
    StyledTypography,
    StyledHeaderTypography,
    StyledGreenBox,
    StyledRedBox,
    StyledBoxExternal,
    StyledBoxInterior,
    StyledPercentTypography,
    StyledLearnedCount,
    StyledContinueLearningButton,
    StyledBackButton,
    StyledStackBox,
} from './styled-components.ts';

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

  const green = '#00C950';
  const red = '#FB2C36';

  const progressBackground = `conic-gradient(${green} 0deg ${learnedAngle}deg, ${red} ${learnedAngle}deg 360deg)`;

  return (
    <StyledContainer>
        <StyledHeaderTypography variant="h4" gutterBottom>
            {!unlearnedCount ? t('learning.allLearned') : t('learning.completedCycle')}
        </StyledHeaderTypography>

        <Stack direction="row" spacing={4} justifyContent="center">
            <Stack direction="row" spacing={1} alignItems="center">
                <StyledGreenBox />
                <StyledTypography variant="body2">
                    {t('learning.learned')}: {learnedCount}
                </StyledTypography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
                <StyledRedBox />
                <StyledTypography variant="body2">
                    {t('learning.notLearned')}: {unlearnedCount}
                </StyledTypography>
            </Stack>
        </Stack>

      <StyledBoxExternal
        sx={{
          background: progressBackground,
        }}
      >
        <StyledBoxInterior
          sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 8px ${theme.palette.divider}`
          }}
        >
          <StyledPercentTypography variant="h4">
            {learnedPercentage}%
          </StyledPercentTypography>
        </StyledBoxInterior>
      </StyledBoxExternal>

        <StyledLearnedCount>
            {t('learning.remainingCards', { count: unlearnedCount })}
        </StyledLearnedCount>

      <StyledStackBox>
          {hasUnlearnedCards && onContinueLearning && (
              <StyledContinueLearningButton
                  variant="contained"
                  onClick={onContinueLearning}
              >
                  {t('learning.continueLearning')}
              </StyledContinueLearningButton>
          )}
          <StyledBackButton
              variant="outlined"
              onClick={onBackToFolders}
          >
              {t('forms.back')}
          </StyledBackButton>
      </StyledStackBox>
    </StyledContainer>
  );
};
