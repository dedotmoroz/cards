import type { ButtonProps } from '@mui/material';
import { StyledButtonLink } from './styled-components';

export interface ButtonLinkProps extends ButtonProps {
  onClick: () => void;
}

export const ButtonLink = ({ children, ...props }: ButtonLinkProps) => {
  return <StyledButtonLink {...props}>{children}</StyledButtonLink>;
};
