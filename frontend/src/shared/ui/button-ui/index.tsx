import type { ButtonProps } from '@mui/material';
import { StyledButtonUI } from './styled-components';

export const ButtonUI = (props: ButtonProps) => {
    return <StyledButtonUI {...props} />;
};

