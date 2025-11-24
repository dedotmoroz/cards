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
    background: linear-gradient(90deg, #4F39F6 0%, #9810FA 50%, #E60076 100%);
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
    background: linear-gradient(135deg, #615FFF 0%, #9810FA 100%);
    box-shadow: 0 10px 15px -3px rgba(97, 95, 255, 0.30), 0 4px 6px -4px rgba(97, 95, 255, 0.30);
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    
    &.MuiButton-root {
        width: 40px;
        height: 40px;
        min-width: 40px;
        padding: 0;
    }
    
    &:hover {
        background: linear-gradient(135deg, #615FFF 0%, #9810FA 100%);
        box-shadow: 0 10px 15px -3px rgba(97, 95, 255, 0.30), 0 4px 6px -4px rgba(97, 95, 255, 0.30);
    }
`;

export const StyledWordIcon = styled(WordIcon)`
    margin: 0;
    width: 24px;
    height: 24px;
`;