/** Full-width waveform player for on-demand context-reading audio. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Pause, PlayArrow } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getContextAudioUrl } from '@/shared/api/contextReadingApi';
import WaveSurfer from 'wavesurfer.js';

type Props = {
  jobId?: string | null;
  artifactId?: string | null;
  hasAudio?: boolean;
  disabled?: boolean;
};

export function ContextReadingAudioPlayer({ jobId, artifactId, hasAudio, disabled }: Props) {
  const { t } = useTranslation();
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioSrc = useMemo(() => {
    if (artifactId) {
      return getContextAudioUrl({ artifactId });
    }
    if (jobId) {
      return getContextAudioUrl({ jobId });
    }
    return null;
  }, [artifactId, jobId]);
  const canRenderPlayer = Boolean(hasAudio && audioSrc);

  useEffect(() => {
    const audio = audioRef.current;
    const container = waveformRef.current;

    if (!canRenderPlayer || !audio || !container) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const waveSurfer = WaveSurfer.create({
      container,
      media: audio,
      height: 56,
      waveColor: '#D3D8E4',
      progressColor: '#5B6CFF',
      cursorColor: '#1F2937',
      barWidth: 3,
      barGap: 2,
      barRadius: 999,
      normalize: true,
      dragToSeek: true,
    });

    const handleReady = () => {
      setDuration(waveSurfer.getDuration());
      setCurrentTime(audio.currentTime || 0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);

    waveSurfer.on('ready', handleReady);
    waveSurfer.on('play', handlePlay);
    waveSurfer.on('pause', handlePause);
    waveSurfer.on('timeupdate', setCurrentTime);
    audio.addEventListener('loadedmetadata', handleReady);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handlePause);

    waveSurferRef.current = waveSurfer;

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleReady);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handlePause);
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [audioSrc, canRenderPlayer]);

  useEffect(() => {
    if (!disabled) {
      return;
    }

    audioRef.current?.pause();
    setIsPlaying(false);
  }, [disabled]);

  const formatTime = (value: number) => {
    if (!Number.isFinite(value) || value < 0) {
      return '0:00';
    }

    const totalSeconds = Math.floor(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTogglePlayback = () => {
    if (disabled) {
      return;
    }

    if (isPlaying) {
      void waveSurferRef.current?.pause();
      return;
    }

    void waveSurferRef.current?.play();
  };

  if (!canRenderPlayer) {
    return null;
  }

  return (
    <Box
      sx={{ width: '100%' }}
      onClick={(event) => event.stopPropagation()}
      onFocus={(event) => event.stopPropagation()}
    >
      <audio ref={audioRef} preload="metadata" src={audioSrc} aria-label={t('contextReading.listen')} />
      <Box
        sx={{
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          px: 1.5,
          py: 1.25,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <IconButton
            onClick={handleTogglePlayback}
            disabled={disabled}
            aria-label={isPlaying ? t('common.pause', { defaultValue: 'Pause' }) : t('contextReading.listen')}
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: 'action.hover',
            }}
          >
            {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 88, flexShrink: 0 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>
        <Box
          ref={waveformRef}
          sx={{
            width: '100%',
            minHeight: 56,
            '& wave': {
              borderRadius: 1,
              overflow: 'hidden',
            },
          }}
        />
      </Box>
    </Box>
  );
}
