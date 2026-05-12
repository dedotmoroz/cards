import type { ButtonProps } from '@mui/material';
import { StyledButtonColor } from './styled-components';

export const ButtonDangerous= ({ children, ...props }: ButtonProps) => {
    return <StyledButtonColor {...props}>{children}</StyledButtonColor>;
};
