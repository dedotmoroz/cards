import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import { ButtonColor, ButtonWhite } from '@/shared/ui';
import {
  StyledHeaderRow,
  StyledPageTitle,
  StyledContainerWrapper,
  StyledChipsSection,
  StyledControlsBlock,
} from './styled-components';

const NO_CARDS_ERROR = 'No cards available for context reading';

export type ContextReadingContextErrorProps = {
  error: string;
  learnFolderPath?: string;
  contextReadingPath?: string;
  onBackToStart: () => void | Promise<void>;
  loading: boolean;
  generating: boolean;
};

export const ContextReadingContextError = ({
  error,
  learnFolderPath,
  contextReadingPath,
  onBackToStart,
  loading,
  generating,
}: ContextReadingContextErrorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isNoCardsError = error === NO_CARDS_ERROR;

  const actionButtons = (
    <StyledControlsBlock>
      {learnFolderPath && (
        <ButtonWhite
          onClick={() => navigate(learnFolderPath)}
          disabled={loading || generating}
          sx={{ borderRadius: '8px' }}
        >
          {t('contextReading.backToFolder')}
        </ButtonWhite>
      )}
      {contextReadingPath && (
        <RouterLink
          to={contextReadingPath}
          style={{
            textDecoration: 'none',
            pointerEvents: loading || generating ? 'none' : undefined,
          }}
          onClick={e => {
            if (loading || generating) {
              e.preventDefault();
              return;
            }
            void onBackToStart();
          }}
          aria-disabled={loading || generating}
        >
          <ButtonColor
            component="span"
            disabled={loading || generating}
            sx={{ borderRadius: '8px' }}
          >
            {t('contextReading.createContentAgain', { defaultValue: 'Create content again' })}
          </ButtonColor>
        </RouterLink>
      )}
    </StyledControlsBlock>
  );

  return (
      <StyledContainerWrapper maxWidth="md">
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}

        <StyledHeaderRow>
            <StyledPageTitle>
                {t('contextReading.title', { defaultValue: 'Context' })}
            </StyledPageTitle>
        </StyledHeaderRow>

      {isNoCardsError ? (
        <StyledChipsSection>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            {t('contextReading.noWordsLeft', {
              defaultValue: 'Слова для создания контента в этой папке закончились.',
            })}
          </Typography>

          {actionButtons}
        </StyledChipsSection>
      ) : (
        <StyledChipsSection>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          {actionButtons}
        </StyledChipsSection>
      )}
    </StyledContainerWrapper>
  );
};
