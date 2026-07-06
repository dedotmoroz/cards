import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReplayIcon } from '@/shared/icons';

export const StyledRestartButton = styled(Button)`
    display: flex;
    padding: 12px 12px;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.60);
    border-radius: 8px;
    background: #fff;
    color: #432DD7;
    text-transform: none;
    gap: 8px;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    box-shadow: none;
    white-space: nowrap;

    &:hover {
        background: #f8f7ff;
        box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.2), 0 4px 6px -4px rgba(99, 102, 241, 0.2);
    }

    &:disabled {
        border: 1px dashed rgba(0, 0, 0, 0.50);
        background: transparent;
    }

    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
`;

export const StyledReplayIcon = styled(ReplayIcon)`
    width: 16px;
    height: 16px;
`;
