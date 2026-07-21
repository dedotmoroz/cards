import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledTextField = styled(TextField)`
    /* Повышаем специфичность, чтобы тень не перекрывалась стилями MUI после перезагрузки */
    && .MuiInputBase-input {
        padding: 14px 14px;
        background: var(--bg-input);
        box-shadow: var(--shadow-inset-input) !important;
    }
`;
