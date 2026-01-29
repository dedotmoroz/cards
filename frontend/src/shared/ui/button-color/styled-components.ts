import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledButtonColor = styled(Button)`
    display: flex;
    color: #fff;
    padding: 15px 30px;
    border: none;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: linear-gradient(90deg, #615FFF 0%, #F6339A 100%);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
    width: 100%;
    
    &:hover {
        box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.3), 0 4px 6px -4px rgba(17, 24, 39, 0.3);
    }
    
    &:disabled {
        background: #fff;
        opacity: 0.5;
    }
    
    & .MuiButton-startIcon {
        margin: 0;
        display: flex;
        align-items: center;
    }
`;
