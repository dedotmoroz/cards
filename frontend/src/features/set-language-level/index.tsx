import { FormControl, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type SetLanguageLevelProps = {
  value: string;
  onChange: (level: string) => void;
  disabled?: boolean;
  formControlSx?: SxProps<Theme>;
};

export const SetLanguageLevel = ({ value, onChange, disabled, formControlSx }: SetLanguageLevelProps) => {
  const { t } = useTranslation();
  const ariaLabel = t('contextReading.languageLevel', { defaultValue: 'Language level' });

  const handleChange = (e: SelectChangeEvent<string>) => {
    onChange(e.target.value);
  };

  const formSx =
    formControlSx !== undefined
      ? ([{ minWidth: 120 }, formControlSx] as SxProps<Theme>)
      : ({ minWidth: 120 } as SxProps<Theme>);

  return (
    <FormControl size="small" sx={formSx}>
      <Select
        value={value}
        inputProps={{ 'aria-label': ariaLabel }}
        onChange={handleChange}
        disabled={disabled}
      >
        {LEVELS.map(level => (
          <MenuItem key={level} value={level}>
            {level}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
