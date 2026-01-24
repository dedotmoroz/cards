import type { ButtonProps } from '@mui/material';
import { StyledButtonBlack } from './styled-components';

export const ButtonBlack = ({ children, ...props }: ButtonProps) => {
    return <StyledButtonBlack {...props}>{children}</StyledButtonBlack>;
};
