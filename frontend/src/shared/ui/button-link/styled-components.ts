import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";

export const StyledButtonLink = styled(Button)`
    display: flex;
    padding: 12px 12px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    color: #4A5565;
    text-transform: none;
    gap: 6px;
    font-size: 16px;
    line-height: 20px;
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
`
