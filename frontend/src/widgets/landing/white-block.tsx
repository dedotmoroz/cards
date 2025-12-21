import {
    Lightbulb
} from '@mui/icons-material';
import {useTranslation} from "react-i18next";

import {
    StyledLampIcon,
    StyledWhiteCard,
    StyledWhiteHeader,
    StyledWhiteText,
    StyledTypographyCrossed,
    StyledTypographyStressed,
} from './styled-components.ts'

export const WhiteBlock = () => {
    const { t } = useTranslation();

    return (
            <StyledWhiteCard>
                <StyledLampIcon>
                    <Lightbulb sx={{ color: 'white' }} />
                </StyledLampIcon>
                <StyledWhiteHeader>
                    {t('landing.context.title')}
                </StyledWhiteHeader>
                <StyledTypographyCrossed>
                    {t('landing.context.subtitle1')}
                </StyledTypographyCrossed>
                <StyledTypographyStressed>
                    {t('landing.context.subtitle2')}
                </StyledTypographyStressed>
                <StyledWhiteText>
                    {t('landing.context.description')}
                </StyledWhiteText>
            </StyledWhiteCard>
    )
}