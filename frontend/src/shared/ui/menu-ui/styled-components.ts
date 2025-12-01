import { Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledMenu = styled(Menu)`
    & .MuiPaper-root {
        border-radius: 8px;
    }
    
    & .MuiList-root {
        padding-top: 4px !important;
        padding-bottom: 4px !important;
    }
    
    & .MuiMenuItem-root {
        border-radius: 4px;
        margin: 4px 8px;
        padding: 6px 16px 6px 8px;
    }
`;

export const StyledMenuItem = styled(MenuItem)`
    border-radius: 8px;
    margin: 4px 8px;
    
    & .MuiTouchRipple-root {
        display: none !important;
    }
`;

