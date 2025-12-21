import {Box} from "@mui/material";
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
    return(
        <StyledExampleCard>
            <StyledExampleHeader>
                <StyledBookIcon>
                    <StyledWordIcon color={'#fff'} />
                </StyledBookIcon>
                <Box>
                    <StyledSideA>
                        overachiever
                    </StyledSideA>
                    <StyledSideB>
                        сверхуспевающий, отличник
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