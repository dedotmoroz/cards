import {useTranslation} from "react-i18next";
import {StyledLogoPlace, StyledWordIcon, StyledLogoText, StyledLogoButton,} from './styled-components.ts'

interface LogoProps {
    handle?: () => void;
}

export const Logo = ({ handle }: LogoProps) => {
    const { t } = useTranslation();
    return (
        <StyledLogoPlace>
            <StyledLogoButton
                variant="contained"
                aria-label={t('navigation.home')}
                onClick={handle}
            >
                <StyledWordIcon />
            </StyledLogoButton>
            <StyledLogoText>
                kotCat
            </StyledLogoText>
        </StyledLogoPlace>
    )
}