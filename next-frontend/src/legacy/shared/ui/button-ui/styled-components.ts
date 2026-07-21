import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledButtonUI = styled(Button)`
    display: flex;
    padding: 8px 12px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    text-transform: none;
    gap: 8px;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    color: var(--text-default);
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
    
    &.MuiButton-contained {
        background: ${({ theme }) => theme.palette.button?.bg || 'var(--bg-inverse)'};
        color: ${({ theme }) => theme.palette.button?.text || 'var(--text-on-inverse)'};
        
        &:hover {
            background: ${({ theme }) => theme.palette.button?.hover || 'var(--bg-inverse-hover)'};
            box-shadow: var(--shadow-ink);
        }
        
        &:disabled {
            background: ${({ theme }) => theme.palette.button?.disabled || 'var(--color-ink-disabled)'};
            opacity: 0.5;
        }
    }
`;
