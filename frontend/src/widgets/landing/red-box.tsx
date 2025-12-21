import {
    Box,
} from '@mui/material';

import {
    ArrowForward,
} from '@mui/icons-material';

import {useTranslation} from "react-i18next";

import {
    StyledGradientCard,
    StyledWhiteButton,
    StyledRedHeader,
    StyledRedDescription
} from './styled-components.ts'

interface RedBoxProps {
  handleStartLearning: () => void;
}

export const RedBox = ({ handleStartLearning }: RedBoxProps) => {
    const { t } = useTranslation();

    return (
        <StyledGradientCard>
            <Box>
                <StyledRedHeader>
                    {t('landing.hero.title')}
                </StyledRedHeader>
                <StyledRedDescription>
                    {t('landing.hero.description')}
                </StyledRedDescription>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <StyledWhiteButton
                        onClick={handleStartLearning}
                        endIcon={<ArrowForward />}
                        size="large"
                    >
                        {t('landing.hero.button')}
                    </StyledWhiteButton>
                </Box>
            </Box>
        </StyledGradientCard>
    )
}