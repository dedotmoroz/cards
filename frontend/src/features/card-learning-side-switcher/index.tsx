import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CardLearningSideSwitcherProps {
  initialSide: 'question' | 'answer';
  onSideChange: (side: 'question' | 'answer') => void;
  disabled?: boolean;
}

export const CardLearningSideSwitcher = ({
  initialSide,
  onSideChange,
  disabled = false,
}: CardLearningSideSwitcherProps) => {
  const { t } = useTranslation();

  const handleSideChange = (event: SelectChangeEvent<string>) => {
    const newSide = event.target.value as 'question' | 'answer';
    onSideChange(newSide);
  };

  return (
    <FormControl size="small" disabled={disabled} sx={{ minWidth: 120 }}>
      <InputLabel id="card-side-select-label">
        {t('learning.initialSide')}
      </InputLabel>
      <Select
        labelId="card-side-select-label"
        id="card-side-select"
        value={initialSide}
        label={t('learning.initialSide')}
        onChange={handleSideChange}
        disabled={disabled}
      >
        <MenuItem value="question">
          {t('learning.sideA')}
        </MenuItem>
        <MenuItem value="answer">
          {t('learning.sideB')}
        </MenuItem>
      </Select>
    </FormControl>
  );
};

