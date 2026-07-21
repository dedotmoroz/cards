import { Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledCheckbox = styled(Checkbox)`
    visibility: visible;
    opacity: 1;
    padding: 2px;
    
    & .MuiSvgIcon-root {
        color: var(--bg-inverse);
        fill: var(--bg-inverse);
        font-size: 16px;
        width: 20px;
        height: 20px;
    }
    
    &.Mui-checked {
        & .MuiSvgIcon-root {
            color: var(--bg-inverse);
            fill: var(--bg-inverse);
        }
    }
`;
