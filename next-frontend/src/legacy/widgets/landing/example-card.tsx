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

type ExampleContext = {
    text: string;
    translation: string;
};

function isExampleContext(item: unknown): item is ExampleContext {
    if (!item || typeof item !== "object") return false;
    const value = item as { text?: unknown; translation?: unknown };
    return typeof value.text === "string" && typeof value.translation === "string";
}

export const ExampleCard = () => {
    const { t } = useTranslation();
    const word = t('landing.exampleCard.word');
    const contexts = t('landing.exampleCard.contexts', { returnObjects: true });
    const first = Array.isArray(contexts) && isExampleContext(contexts[0])
        ? contexts[0]
        : null;
    const firstText = first?.text ?? '';
    const highlightIndex = firstText.toLowerCase().indexOf(word.toLowerCase());
    
    return(
        <StyledExampleCard>
            <StyledExampleHeader>
                <StyledBookIcon>
                    <StyledWordIcon color={'#fff'} />
                </StyledBookIcon>
                <Box>
                    <StyledSideA>
                        {word}
                    </StyledSideA>
                    <StyledSideB>
                        {t('landing.exampleCard.translation')}
                    </StyledSideB>
                </Box>
            </StyledExampleHeader>
            <StyledTranslateBlock>
                {highlightIndex === -1 ? (
                    firstText
                ) : (
                    <>
                        {firstText.slice(0, highlightIndex)}
                        <StyledColorText>
                            {firstText.slice(highlightIndex, highlightIndex + word.length)}
                        </StyledColorText>
                        {firstText.slice(highlightIndex + word.length)}
                    </>
                )}
                {first?.translation ? (
                    <Box sx={{ mt: 1, color: 'text.secondary', fontSize: 16 }}>
                        {first.translation}
                    </Box>
                ) : null}
            </StyledTranslateBlock>
        </StyledExampleCard>
    )
}
