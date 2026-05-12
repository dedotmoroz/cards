import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledButtonColor = styled(Button)`
    display: flex;
    color: #da4949;
    padding: 15px 30px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 2px solid #da4949;
    background: #fff;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
    width: 100%;

    &:hover {
        box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.3), 0 4px 6px -4px rgba(17, 24, 39, 0.3);
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
