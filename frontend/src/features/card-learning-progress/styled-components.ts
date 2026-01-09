import { styled } from '@mui/material/styles';
import { LinearProgress } from '@mui/material';

export const StyledLinearProgress = styled(LinearProgress)`
    height: 8px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.60);
    
    & .MuiLinearProgress-bar {
        border-radius: 4px;
        background: linear-gradient(90deg, #615FFF 0%, #AD46FF 50%, #F6339A 100%);
    }
`;

