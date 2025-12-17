import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import NoteAdd from '@mui/icons-material/NoteAddOutlined';


export const StyledButton = styled(Button)`
    display: flex;
    padding: 8px 12px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: rgba(17, 24, 39, 0.8);
    color: #ffffff;
    text-transform: none;
    gap: 8px;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    
    &:hover {
        background: rgba(17, 24, 39, 0.9);
        box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.3), 0 4px 6px -4px rgba(17, 24, 39, 0.3);
    }
    
    &:disabled {
        background: #030213;
        opacity: 0.5;
    }
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
`;

export const StyledPlusIcon = styled(NoteAdd)`
    margin: 0;
`;

