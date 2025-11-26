import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { WordIcon } from "@/shared/icons";

export const StyledButton = styled(Button)`
    display: flex;
    padding: 8px 12px;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.60);
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(97, 95, 255, 0.20) 0%, rgba(43, 127, 255, 0.20) 100%);
    color: #432DD7;
    text-transform: none;
    gap: 8px;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    box-shadow: none;
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
        background: linear-gradient(to right, rgba(99, 102, 241, 0.3), rgba(59, 130, 246, 0.3));
        box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -4px rgba(99, 102, 241, 0.3);
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

export const StyledWordIcon = styled(WordIcon)`
    margin: 0;
`;

