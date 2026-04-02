// import {
//     Lightbulb
// } from '@mui/icons-material';
import {useTranslation} from "react-i18next";

import {
    // StyledLampIcon,
    StyledWhiteCard,
    StyledWhiteHeader,
    // StyledWhiteText,
    StyledTypographyStressed,
    StyledTypographyOrdinary,
    StyledWhiteCardContainer,
    StyledTypographyBold,
} from './styled-components.ts'

export const WhiteBlock = () => {
    const { t } = useTranslation();

    return (
        <StyledWhiteCard>
                {/*<StyledLampIcon>*/}
                {/*    <Lightbulb sx={{color: 'white'}}/>*/}
                {/*</StyledLampIcon>*/}
                <StyledWhiteHeader>
                    {t('landing.context.title')}
                </StyledWhiteHeader>
            <StyledWhiteCardContainer>
                <StyledTypographyStressed>
                    {t('landing.context.subtitle')}
                </StyledTypographyStressed>
                <StyledTypographyOrdinary>
                    <StyledTypographyBold>
                        {t('landing.context.subtitleBold1')}
                    </StyledTypographyBold>
                    {t('landing.context.subtitle1')}
                </StyledTypographyOrdinary>
                <StyledTypographyOrdinary>
                    <StyledTypographyBold>
                        {t('landing.context.subtitleBold2')}
                    </StyledTypographyBold>
                    {t('landing.context.subtitle2')}
                </StyledTypographyOrdinary>
                <StyledTypographyOrdinary>
                    <StyledTypographyBold>
                        {t('landing.context.subtitleBold3')}
                    </StyledTypographyBold>
                    {t('landing.context.subtitle3')}
                </StyledTypographyOrdinary>
                {/*<StyledWhiteText>*/}
                {/*    {t('landing.context.description')}*/}
                {/*</StyledWhiteText>*/}
            </StyledWhiteCardContainer>
        </StyledWhiteCard>
    )
}