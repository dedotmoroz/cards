import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';

const CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX = { fontSize: { xs: '28px' } };

export type ContextReadingContextLoadingProps = {
  learnFolderPath?: string;
};

export const ContextReadingContextLoading = ({ learnFolderPath }: ContextReadingContextLoadingProps) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} disabled />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ ml: { xs: 2, sm: 4 }, ...CONTEXT_READING_TITLE_MOBILE_FONTSIZE_SX }}>
          {t('contextReading.title', { defaultValue: 'Context' })}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 'calc(100dvh - 200px)',
          px: 2,
          pb: 4,
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">
          {t('contextReading.generating', { defaultValue: 'Generating text...' })}
        </Typography>
      </Box>
    </Container>
  );
};
