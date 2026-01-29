import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledTextField = styled(TextField)`
    /* Повышаем специфичность, чтобы тень не перекрывалась стилями MUI после перезагрузки */
    && .MuiInputBase-input {
        padding: 14px 14px;
        background: #fffeef;
        box-shadow: inset 1px 3px 5px 0 rgba(0, 0, 0, 0.20) !important;
    }
`;

