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
    top: -14px;
    width: 100%;
    position: absolute;
`

/** Счётчик в стиле glass: размытие фона и полупрозрачность (как в Liquid Glass, fallback без SVG displacement) */
export const StyledCount = styled(Box)`
    display: inline-block;
    padding: 6px 14px;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 500;

    /* Glass: полупрозрачный фон + размытие фона */
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(12px);

    /* Лёгкая граница и блик как у стекла */
    border: 1px solid rgba(255, 255, 255, 0.45);
    box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
`