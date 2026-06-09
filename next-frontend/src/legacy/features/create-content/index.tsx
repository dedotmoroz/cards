import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@mui/material';
import { ButtonColor } from '@/shared/ui';

export type CreateContentButtonProps = Pick<ButtonProps, 'disabled' | 'sx'> & {
  onClick: ButtonProps['onClick'];
};

export const CreateContentButton = ({ onClick, disabled, sx }: CreateContentButtonProps) => {
  const { t } = useTranslation();

  return (
    <ButtonColor onClick={onClick} disabled={disabled} sx={sx}>
      {t('contextReading.createContent', { defaultValue: 'Create content' })}
    </ButtonColor>
  );
};
