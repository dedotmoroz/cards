import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getContextAudioUrl } from '@/shared/api/contextReadingApi';

type Props = {
  jobId: string;
  hasAudio?: boolean;
  disabled?: boolean;
};

export function ContextReadingAudioPlayer({ jobId, hasAudio, disabled }: Props) {
  const { t } = useTranslation();

  if (!hasAudio || !jobId) {
    return null;
  }

  return (
    <Box
      sx={{ ml: 1, flexShrink: 0 }}
      onClick={(event) => event.stopPropagation()}
      onFocus={(event) => event.stopPropagation()}
    >
      <audio
        controls
        preload="none"
        disabled={disabled}
        src={getContextAudioUrl(jobId)}
        aria-label={t('contextReading.listen')}
        style={{ height: 32, maxWidth: 280 }}
      />
    </Box>
  );
}
