import React from "react";
import { Select, MenuItem } from "@mui/material";
import type { SelectProps } from "@mui/material";
import { styled } from "@mui/material/styles";


const BaseStyledSelect = styled(Select)`
    display: flex;
    padding: 4px 12px;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    color: #4A5565;
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
    font-size: 18px;
`;

