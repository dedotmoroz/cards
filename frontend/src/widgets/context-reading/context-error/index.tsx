import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import { ButtonLink } from '@/shared/ui';
import { SetLanguageLevel } from '@/features/set-language-level';
import { CreateContentButton } from '@/features/create-content';

const CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX = { fontSize: { xs: '28px' } };

const NO_CARDS_ERROR = 'No cards available for context reading';

export type ContextReadingContextErrorProps = {
  error: string;
  learnFolderPath?: string;
  folderId: string;
  languageLevel: string;
  onLanguageLevelChange: (level: string) => void;
  onCreateContent: () => void | Promise<void>;
  loading: boolean;
  generating: boolean;
};

export const ContextReadingContextError = ({
  error,
  learnFolderPath,
  folderId,
  languageLevel,
  onLanguageLevelChange,
  onCreateContent,
  loading,
  generating,
}: ContextReadingContextErrorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isNoCardsError = error === NO_CARDS_ERROR;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
          {t('contextReading.title', { defaultValue: 'Context' })}
        </Typography>
      </Box>
      {isNoCardsError ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.primary' }}>
            {t('contextReading.noWordsLeft', {
              defaultValue: 'Слова для создания контента в этой папке закончились.',
            })}
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <SetLanguageLevel
                value={languageLevel}
                onChange={onLanguageLevelChange}
                disabled={loading || generating}
              />
              <CreateContentButton onClick={onCreateContent} disabled={loading || generating} sx={{ minWidth: 200 }} />
            </Box>
            {learnFolderPath && (
              <ButtonLink
                onClick={() => navigate(learnFolderPath)}
                disabled={loading || generating}
                sx={{ minWidth: 200 }}
              >
                {t('contextReading.backToFolder', { defaultValue: 'Вернуться в папку' })}
              </ButtonLink>
            )}
          </Box>
        </Box>
      ) : (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          {folderId && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CreateContentButton onClick={onCreateContent} disabled={loading || generating} sx={{ minWidth: 220 }} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
