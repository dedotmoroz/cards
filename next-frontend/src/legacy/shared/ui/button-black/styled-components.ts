import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledButtonBlack = styled(Button)`
    display: flex;
    padding: 8px 12px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: var(--bg-inverse);
    color: var(--text-on-inverse);
    text-transform: none;
    gap: 8px;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    
    &:hover {
        background: var(--bg-inverse-hover);
        box-shadow: var(--shadow-ink);
    }
    
    &:disabled {
        background: var(--bg-surface);
        border: 1px dashed var(--border-inverse);
    }

    &::before {
        display: none;
    }
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
`;
