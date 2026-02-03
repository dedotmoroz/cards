import { styled } from '@mui/material/styles';
import { LinearProgress, Box } from '@mui/material';

export const StyledLinearProgress = styled(LinearProgress)`
    height: 8px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.60);
    
    & .MuiLinearProgress-bar {
        border-radius: 4px;
        background: linear-gradient(90deg, #615FFF 0%, #AD46FF 50%, #F6339A 100%);
    }
`;

export const StyledBox = styled(Box)`
    position: relative;
`

export const StyledCardCount = styled(Box)`
    display: flex;
    justify-content: center;
    top: -8px;
    width: 100%;
    position: absolute;
`

export const StyledCount = styled(Box)`
    display: block;
    background: rgba(255, 255, 255, 0.8);
    padding: 0 8px;
    border-radius: 12px;
    font-size: 16px;
`