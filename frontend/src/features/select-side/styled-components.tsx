import { Select, MenuItem } from "@mui/material";
import type { SelectProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

const BaseStyledSelect = styled(Select)`
    display: flex;
    height: 42px;
    padding: 0 12px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.40);
    background: rgba(255, 255, 255, 0.50);
    font-size: 14px;
    
    & .MuiSelect-select {
        padding: 0;
    }
    
    & .MuiOutlinedInput-notchedOutline {
        border: none;
    }
    
    & fieldset {
        border: none;
    }
    
    &::before,
    &::after {
        display: none;
    }
    
    & .MuiInput-underline::before,
    & .MuiInput-underline::after {
        display: none;
    }
`;

export const StyledSelect = React.forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
    return (
        <BaseStyledSelect
            {...props}
            ref={ref}
            MenuProps={{
                PaperProps: {
                    sx: {
                        borderRadius: '8px',
                    }
                },
                ...props.MenuProps,
            }}
        />
    );
});

StyledSelect.displayName = 'StyledSelect';

export const StyledMenuItem = styled(MenuItem)`
    font-size: 14px;
`;

