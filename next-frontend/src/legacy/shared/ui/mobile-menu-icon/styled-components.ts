import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledMenuButton = styled(Button)`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    background: transparent;
    color: var(--text-default);
    box-shadow: none;
    border-radius: 8px;
    
    &.MuiButton-root {
        width: 42px;
        height: 42px;
        min-width: 40px;
        padding: 0;
    }

    &:hover {
        background: var(--bg-surface);
        box-shadow: var(--shadow-ink);
    }
`;
