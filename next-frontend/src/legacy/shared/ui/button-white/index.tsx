import type { ButtonProps } from '@mui/material';
import { StyledButtonWhite } from './styled-components';

export const ButtonWhite = ({ children, ...props }: ButtonProps) => {
    return <StyledButtonWhite {...props}>{children}</StyledButtonWhite>;
};
