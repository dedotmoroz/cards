import { Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledUserCard = styled(Box)`
    cursor: pointer;
    transition: background-color 0.2s;

    display: flex;
    //height: 48px;
    padding: 9px 17px;
    justify-content: center;
    align-items: center;
    gap: 12px;
    
    border-radius: 14px;
    // border: 1px solid rgba(255, 255, 255, 0.40);
    background: rgba(255, 255, 255, 0.50);
    
    margin-left: 18px;
    
    &:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }
`;

export const StyledAvatar = styled(Avatar)`
    width: 32px;
    height: 32px;
    background-color: #fff;
    color: rgba(0, 0, 0, 0.9);
`;

