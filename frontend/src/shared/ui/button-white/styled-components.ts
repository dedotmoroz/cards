import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledButtonWhite = styled(Button)`
    display: flex;
    padding: 15px 30px;
    justify-content: center;
    align-items: center;
    border-radius: 14px;
    border: 1px solid #E5E7EB;
    background: #FFF;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    color: #364153;
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
