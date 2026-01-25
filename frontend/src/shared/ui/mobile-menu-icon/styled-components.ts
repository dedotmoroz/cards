import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledMenuButton = styled(Button)`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    background: transparent;
    color: #000;
    //background: rgba(17, 24, 39, 0.8);
    //color: #ffffff;
    box-shadow: none;
    border-radius: 8px;
    //border: 1px solid #fff;
    // background: linear-gradient(135deg, #615FFF 0%, #9810FA 100%);
    // box-shadow: 0 10px 15px -3px rgba(97, 95, 255, 0.30), 0 4px 6px -4px rgba(97, 95, 255, 0.30);
    // transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    
    &.MuiButton-root {
        width: 42px;
        height: 42px;
        min-width: 40px;
        padding: 0;
    }

    &:hover {
        //border: 1px solid rgba(255, 255, 255, 0.20);
        background: rgba(17, 24, 39, 0.9);
        box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.3), 0 4px 6px -4px rgba(17, 24, 39, 0.3);
    }
`;
