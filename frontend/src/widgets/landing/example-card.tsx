import {Box} from "@mui/material";
import {useTranslation} from "react-i18next";
import {
    StyledExampleCard,
    StyledBookIcon,
    StyledExampleHeader,
    StyledSideA,
    StyledSideB,
    StyledTranslateBlock,
    StyledColorText,
} from './styled-components.ts';
import {StyledWordIcon} from "@/shared/ui/logo/styled-components.ts";


export const ExampleCard = () => {
    const { t } = useTranslation();
    
    return(
        <StyledExampleCard>
            <StyledExampleHeader>
                <StyledBookIcon>
                    <StyledWordIcon color={'#fff'} />
                </StyledBookIcon>
                <Box>
                    <StyledSideA>
                        {t('landing.exampleCard.word')}
                    </StyledSideA>
                    <StyledSideB>
                        {t('landing.exampleCard.translation')}
                    </StyledSideB>
                </Box>
            </StyledExampleHeader>
            <StyledTranslateBlock>
                Being an <StyledColorText>overachiever</StyledColorText> can
                sometimes lead to communication issues because others may feel
                pressured to meet your high standards.
            </StyledTranslateBlock>
        </StyledExampleCard>
    )
}