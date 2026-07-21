import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledButtonColor = styled(Button)`
    display: flex;
    color: var(--text-on-brand);
    padding: 15px 30px;
    border: none;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: var(--gradient-cta);
    box-shadow: var(--shadow-default);
    width: 100%;
    
    &:hover {
        box-shadow: var(--shadow-ink);
    }
    
    &:disabled {
        outline: 1px dashed var(--border-dashed);
        background: var(--bg-surface);
        opacity: 0.5;
    }
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
`;
