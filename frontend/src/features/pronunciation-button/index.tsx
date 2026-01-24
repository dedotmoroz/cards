import { IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useTranslation } from 'react-i18next';
import { speak } from '@/shared/libs/speak';

export interface PronunciationButtonProps {
  text: string;
  lang?: string;
  size?: 'small' | 'medium';
}

export const PronunciationButton = ({
  text,
  lang,
  size = 'small',
}: PronunciationButtonProps) => {
  const { t, i18n } = useTranslation();
  const i18nLang = lang ?? i18n.language;

  if (!text?.trim()) return null;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    speak(text, i18nLang);
  };

  return (
    <IconButton
      size={size}
      onClick={handleClick}
      aria-label={t('cards.pronounce', 'Произнести')}
      sx={{ ml: 0.5, flexShrink: 0 }}
    >
      <VolumeUpIcon fontSize={size} />
    </IconButton>
  );
};
