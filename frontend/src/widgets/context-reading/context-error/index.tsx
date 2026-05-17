import { useNavigate } from 'react-router-dom';
import { Typography, Box, Alert, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import { ButtonLink } from '@/shared/ui';
import { SetLanguageLevel } from '@/features/set-language-level';
import { CreateContentButton } from '@/features/create-content';
import {
    StyledHeaderRow,
    StyledPageTitle,
    StyledContainerWrapper
} from "./styled-components.ts";


const NO_CARDS_ERROR = 'No cards available for context reading';

export type ContextReadingContextErrorProps = {
  error: string;
  learnFolderPath?: string;
  folderId: string;
  languageLevel: string;
  onLanguageLevelChange: (level: string) => void;
  onlyUnlearnedWords: boolean;
  onOnlyUnlearnedWordsChange: (value: boolean) => void;
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
  onlyUnlearnedWords,
  onOnlyUnlearnedWordsChange,
  onCreateContent,
  loading,
  generating,
}: ContextReadingContextErrorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isNoCardsError = error === NO_CARDS_ERROR;

  return (
      <StyledContainerWrapper maxWidth="md">
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}

        <StyledHeaderRow>
            <StyledPageTitle>
                {t('contextReading.title', { defaultValue: 'Context' })}
            </StyledPageTitle>
        </StyledHeaderRow>

      {isNoCardsError ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.primary' }}>
            {t('contextReading.noWordsLeft', {
              defaultValue: 'Слова для создания контента в этой папке закончились.',
            })}
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onlyUnlearnedWords}
                    onChange={(_, checked) => onOnlyUnlearnedWordsChange(checked)}
                    disabled={loading || generating}
                  />
                }
                label={t('contextReading.onlyUnlearned', { defaultValue: 'Only unlearned words' })}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <SetLanguageLevel
                value={languageLevel}
                onChange={onLanguageLevelChange}
                disabled={loading || generating}
              />
              <CreateContentButton onClick={onCreateContent} disabled={loading || generating} sx={{ minWidth: 200 }} />
            </Box>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onlyUnlearnedWords}
                    onChange={(_, checked) => onOnlyUnlearnedWordsChange(checked)}
                    disabled={loading || generating}
                  />
                }
                label={t('contextReading.onlyUnlearned', { defaultValue: 'Only unlearned words' })}
              />
              <CreateContentButton onClick={onCreateContent} disabled={loading || generating} sx={{ minWidth: 220 }} />
            </Box>
          )}
        </>
      )}
    </StyledContainerWrapper>
  );
};
