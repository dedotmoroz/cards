import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";

export const StyledIconButton = styled(IconButton)`
    display: flex;
    width: 38px;
    height: 32px;
    justify-content: center;
    align-items: center;

    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.30);
    background: rgba(255, 255, 255, 0.50);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10);

    &:hover {
        background: rgba(255, 255, 255, 0.50);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }
`

