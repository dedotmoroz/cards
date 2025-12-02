import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledGenerateButton = styled(Button)`
    min-width: 0;
    padding: ${({ theme }) => theme.spacing(0.5)};
    color: ${({ theme }) => theme.palette.text.secondary};
`;

