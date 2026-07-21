import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledButtonWhite = styled(Button)`
    display: flex;
    padding: 15px 30px;
    justify-content: center;
    align-items: center;
    border-radius: 14px;
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    box-shadow: var(--shadow-sm);
    color: var(--text-body);
    width: 100%;
    
    &:hover {
        box-shadow: var(--shadow-ink);
    }
    
    &:disabled {
        background: var(--bg-surface);
        opacity: 0.5;
    }
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
`;
