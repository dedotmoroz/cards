import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const SelectSide = () => {
    const { t } = useTranslation();

    const [initialSide, setInitialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleInitialSideChange = (side: 'question' | 'answer') => {
        setInitialSide(side);
        localStorage.setItem('cardInitialSide', side);
    };

    return (
        <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('learning.initialSide')}</InputLabel>
            <Select
                value={initialSide}
                label={t('learning.initialSide')}
                onChange={(e) => handleInitialSideChange(e.target.value as 'question' | 'answer')}
                sx={{ borderRadius: 2 }}
            >
                <MenuItem value="question">{t('learning.showQuestion')}</MenuItem>
                <MenuItem value="answer">{t('learning.showAnswer')}</MenuItem>
            </Select>
        </FormControl>
    );
};

