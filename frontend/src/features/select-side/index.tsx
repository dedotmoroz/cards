import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {StyledSelect, StyledMenuItem} from "./styled-components.tsx";

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
            <StyledSelect
                variant={'standard'}
                displayEmpty
                value={initialSide}
                label={t('learning.initialSide')}
                onChange={(e) => handleInitialSideChange(e.target.value as 'question' | 'answer')}
            >
                <StyledMenuItem value="question">{t('learning.showQuestion')}</StyledMenuItem>
                <StyledMenuItem value="answer">{t('learning.showAnswer')}</StyledMenuItem>
            </StyledSelect>
    );
};

