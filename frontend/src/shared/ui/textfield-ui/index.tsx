import { useState } from 'react';
import { InputAdornment, IconButton } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { StyledTextField } from './styled-components';

export interface TextFieldUIProps extends Omit<TextFieldProps, 'type'> {
    showPasswordToggle?: boolean;
    type?: TextFieldProps['type'];
}

export const TextFieldUI = ({ 
    showPasswordToggle,
    type = 'text',
    InputProps,
    ...props 
}: TextFieldUIProps) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const isPasswordType = type === 'password';
    const shouldShowToggle = isPasswordType && (showPasswordToggle !== false);
    const finalType = shouldShowToggle && showPassword ? 'text' : (type || 'text');

    return (
        <StyledTextField
            {...props}
            type={finalType}
            InputProps={{
                ...InputProps,
                endAdornment: shouldShowToggle ? (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label={showPassword ? 'hide password' : 'show password'}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ) : InputProps?.endAdornment,
            }}
        />
    );
};
