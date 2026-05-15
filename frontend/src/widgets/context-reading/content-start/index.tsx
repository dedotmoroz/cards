import { Container, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import { SetLanguageLevel } from '@/features/set-language-level';
import { CreateContentButton } from '@/features/create-content';

const CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX = { fontSize: { xs: '28px' } };

export type ContextReadingContentStartProps = {
  learnFolderPath?: string;
  languageLevel: string;
  onLanguageLevelChange: (level: string) => void;
  onCreateContent: () => void | Promise<void>;
  loading: boolean;
  generating: boolean;
};

export const ContextReadingContentStart = ({
  learnFolderPath,
  languageLevel,
  onLanguageLevelChange,
  onCreateContent,
  loading,
  generating,
}: ContextReadingContentStartProps) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ ml: { xs: 2, sm: 4 }, ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
          {t('contextReading.title', { defaultValue: 'Context' })}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          ml: { xs: 2, sm: 4 },
          mt: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          <SetLanguageLevel
            value={languageLevel}
            onChange={onLanguageLevelChange}
            disabled={loading || generating}
          />
          <CreateContentButton onClick={onCreateContent} disabled={loading || generating} sx={{ minWidth: 220 }} />
        </Box>
      </Box>
    </Container>
  );
};
