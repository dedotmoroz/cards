import { Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AccountCircle } from '@mui/icons-material';

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
    
    margin-left: 18px;

    &:hover {
        border: 1px solid var(--border-glass);
        background: var(--bg-surface);
        box-shadow: var(--shadow-ink);
    }
`;

export const StyledAvatar = styled(Avatar)`
    width: 32px;
    height: 32px;
    background: none;
`;

export const StyledAccountCircle = styled(AccountCircle)`
    font-size: 28px;
    color: var(--text-default);
`;
