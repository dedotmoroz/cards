import { FormControl } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {StyledSelect, StyledMenuItem} from "./styled-components.tsx";

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

  const handleSideChange = (event: SelectChangeEvent<unknown>) => {
    const newSide = event.target.value as 'question' | 'answer';
    onSideChange(newSide);
  };

  return (
    <FormControl size="small" disabled={disabled} sx={{ minWidth: 120 }}>
      <StyledSelect
        labelId="card-side-select-label"
        id="card-side-select"
        value={initialSide}
        label={t('learning.initialSide')}
        onChange={handleSideChange}
        disabled={disabled}
      >
        <StyledMenuItem value="question">
          {t('learning.sideA')}
        </StyledMenuItem>
        <StyledMenuItem value="answer">
          {t('learning.sideB')}
        </StyledMenuItem>
      </StyledSelect>
    </FormControl>
  );
};

