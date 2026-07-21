import {Box, Button} from "@mui/material";
import { styled } from "@mui/material/styles";
import { WordIcon } from "@/shared/icons";

export const StyledLogoPlace = styled(Box)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
`

export const StyledLogoText = styled(Box)`
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    background: var(--gradient-brand);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`
export const StyledLogoButton = styled(Button)`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-radius: 14px;
    background: var(--gradient-logo-icon);
    box-shadow: var(--shadow-brand);
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    
    &.MuiButton-root {
        width: 40px;
        height: 40px;
        min-width: 40px;
        padding: 0;
    }
    
    &:hover {
        background: var(--gradient-logo-icon);
        box-shadow: var(--shadow-brand);
    }
`;

export const StyledWordIcon = styled(WordIcon)`
    margin: 0;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
`;
