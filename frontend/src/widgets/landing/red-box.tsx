import {
    ArrowForward,
} from '@mui/icons-material';

import {useTranslation} from "react-i18next";

import {
    StyledGradientCard,
    StyledWhiteButton,
    StyledRedHeader,
    StyledRedDescription,
    StyledRedContent,
    StyledRedContainer,
} from './styled-components.ts'

interface RedBoxProps {
  handleStartLearning: () => void;
}

export const RedBox = ({ handleStartLearning }: RedBoxProps) => {
    const { t } = useTranslation();

    return (
        <StyledGradientCard>
            <StyledRedContainer>
                <StyledRedHeader>
                    {t('landing.hero.title')}
                </StyledRedHeader>
                <StyledRedDescription>
                    {t('landing.hero.description')}
                </StyledRedDescription>
                <StyledRedContent>
                    <StyledWhiteButton
                        onClick={handleStartLearning}
                        endIcon={<ArrowForward />}
                        size="large"
                    >
                        {t('landing.hero.button')}
                    </StyledWhiteButton>
                </StyledRedContent>
            </StyledRedContainer>
        </StyledGradientCard>
    )
}