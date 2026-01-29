import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledTextField = styled(TextField)`
    background: #fffeef;
    box-shadow: inset 3px 3px 5px 0 rgba(0, 0, 0, 0.10);
    
    & .MuiInputBase-input {
        padding: 14px 14px;
    }
`;

