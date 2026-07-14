import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getContextAudioUrl } from '@/shared/api/contextReadingApi';

type Props = {
  jobId?: string | null;
  artifactId?: string | null;
  hasAudio?: boolean;
  disabled?: boolean;
};

export function ContextReadingAudioPlayer({ jobId, artifactId, hasAudio, disabled }: Props) {
  const { t } = useTranslation();

  const audioSrc = artifactId
    ? getContextAudioUrl({ artifactId })
    : jobId
      ? getContextAudioUrl({ jobId })
      : null;

  if (!hasAudio || !audioSrc) {
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
        src={audioSrc}
        aria-label={t('contextReading.listen')}
        style={{
          height: 32,
          maxWidth: 280,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      />
    </Box>
  );
}
