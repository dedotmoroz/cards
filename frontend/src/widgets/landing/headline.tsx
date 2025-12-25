import {
    Box,
} from '@mui/material';
import {
    ArrowForward,
} from '@mui/icons-material';

import {
    StyledChip,
    StyledFS,
    StyledFirstScreenTitle,
    StyledFirstScreenDescription,
    StyledInButton,
    StyledShowButton,
} from './styled-components.ts'

import {useTranslation} from "react-i18next";
import { useAuthStore } from '@/shared/store/authStore';

interface HeadlineProps {
  handleStartLearning: () => void;
}

export const Headline = ({ handleStartLearning }: HeadlineProps) => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    
    // Проверяем, является ли пользователь зарегистрированным (не гостем)
    const isRegistered = user && !user.isGuest;

    return (
        <>
            <StyledChip
                label={<StyledFS>{t('landing.firstScreen.tag')}</StyledFS>}
            />
            <StyledFirstScreenTitle>
                {t('landing.firstScreen.title')}
            </StyledFirstScreenTitle>
            <StyledFirstScreenDescription>
                {t('landing.firstScreen.description')}
            </StyledFirstScreenDescription>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <StyledInButton
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleStartLearning}
                >
                    {isRegistered ? t('learning.wantToContinue') : t('landing.firstScreen.button1')}
                </StyledInButton>
                {!isRegistered && (
                    <StyledShowButton
                        variant="outlined"
                        onClick={() => {
                            const featuresSection = document.getElementById('features-section');
                            featuresSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        {t('landing.firstScreen.button2')}
                    </StyledShowButton>
                )}
            </Box>
        </>
    )
}