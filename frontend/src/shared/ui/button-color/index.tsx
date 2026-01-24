import type { ButtonProps } from '@mui/material';
import { StyledButtonColor } from './styled-components';

export const ButtonColor = ({ children, ...props }: ButtonProps) => {
    return <StyledButtonColor {...props}>{children}</StyledButtonColor>;
};
