import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PlusIcon } from "@/shared/icons";

export const StyledAddButton = styled(Button)`
    display: flex;
    padding: 8px 12px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: #030213;
    color: #ffffff;
    text-transform: none;
    gap: 8px;
    margin-right: 16px;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    
    &:hover {
        background: #030213;
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

export const StyledPlusIcon = styled(PlusIcon)`
    margin: 0;
`;

