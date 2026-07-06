import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReplayIcon } from '@/shared/icons';

export const StyledRestartButton = styled(Button)`
    display: flex;
    padding: 8px 8px;
    border: none;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    text-transform: none;
    background: #fff;
    color: #432DD7;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
    white-space: nowrap;

    &:hover {
        background: #f8f7ff;
        box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.2), 0 4px 6px -4px rgba(17, 24, 39, 0.2);
    }

    &:disabled {
        outline: 1px dashed rgba(0, 0, 0, 0.8);
        background: #fff;
        opacity: 0.5;
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
