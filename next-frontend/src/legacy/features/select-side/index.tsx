import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import {StyledSelect, StyledMenuItem} from "./styled-components.tsx";

export const SelectSide = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [initialSide, setInitialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleInitialSideChange = (side: 'question' | 'answer') => {
        setInitialSide(side);
        localStorage.setItem('cardInitialSide', side);
    };

    return (
            <StyledSelect
                variant={'standard'}
                displayEmpty
                value={initialSide}
                label={t('learning.initialSide')}
                onChange={(e) => handleInitialSideChange(e.target.value as 'question' | 'answer')}
            >
                <StyledMenuItem value="question">
                    {isMobile ? 'A' : t('learning.showQuestion')}
                </StyledMenuItem>
                <StyledMenuItem value="answer">
                    {isMobile ? 'B' : t('learning.showAnswer')}
                </StyledMenuItem>
            </StyledSelect>
    );
};

