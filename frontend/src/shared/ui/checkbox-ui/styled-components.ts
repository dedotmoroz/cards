import { Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledCheckbox = styled(Checkbox)`
    visibility: visible;
    opacity: 1;
    padding: 2px;
    
    & .MuiSvgIcon-root {
        color: rgba(17, 24, 39, 0.8);
        fill: rgba(17, 24, 39, 0.8);
        font-size: 16px;
        width: 20px;
        height: 20px;
        clip-path: inset(0 round 4px);
    }
    
    &.Mui-checked {
        & .MuiSvgIcon-root {
            color: rgba(17, 24, 39, 0.8);
            fill: rgba(17, 24, 39, 0.8);
        }
    }
`;

