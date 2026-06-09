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
    color: #000;
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
    
    &.MuiButton-contained {
        background: ${({ theme }) => theme.palette.button?.bg || 'rgba(17, 24, 39, 0.8)'};
        color: ${({ theme }) => theme.palette.button?.text || '#ffffff'};
        
        &:hover {
            background: ${({ theme }) => theme.palette.button?.hover || 'rgba(17, 24, 39, 0.9)'};
            box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.3), 0 4px 6px -4px rgba(17, 24, 39, 0.3);
        }
        
        &:disabled {
            background: ${({ theme }) => theme.palette.button?.disabled || '#030213'};
            opacity: 0.5;
        }
    }
`;

