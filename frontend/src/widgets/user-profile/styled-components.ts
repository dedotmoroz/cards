import { Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledUserCard = styled(Box)`
    cursor: pointer;
    transition: box-shadow 0.3s;

    display: flex;
    padding: 5px 12px 5px 12px;
    justify-content: center;
    align-items: center;
    gap: 12px;
    border: 1px solid transparent;
    border-radius: 8px;
    // background: rgba(255, 255, 255, 0.50);
    
    margin-left: 18px;

    &:hover {
        border: 1px solid rgba(255, 255, 255, 0.20);
        background: rgba(255, 255, 255, 1);
        box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.2), 0 4px 6px -4px rgba(17, 24, 39, 0.2);
    }
`;

export const StyledAvatar = styled(Avatar)`
    width: 32px;
    height: 32px;
    background-color: #fff;
    color: rgba(0, 0, 0, 0.9);
`;

