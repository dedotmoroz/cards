import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledGenerateAllButton = styled(Button)`
    min-width: 0;
    padding: ${({ theme }) => theme.spacing(0.5)};
    color: ${({ theme }) => theme.palette.text.secondary};
    justify-self: flex-end;
    align-self: flex-end;
`;

