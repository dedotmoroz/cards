import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PlayIcon, PlayPauseIcon } from "@/shared/icons";

export const StyledButton = styled(Button)`
    display: flex;
    padding: 8px 20px;
    border: none;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    text-transform: none;
    background: linear-gradient(90deg, #615FFF 0%, #F6339A 100%);
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

export const StyledPlayIcon = styled(PlayIcon)`
    width: 16px;
    height: 16px;
`;

export const StyledPlayPauseIcon = styled(PlayPauseIcon)`
    width: 16px;
    height: 16px;
`;
