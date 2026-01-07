import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CircularProgress } from '@mui/material';

export const StyledGenerateButton = styled(Button)`
    min-width: 0;
    padding: ${({ theme }) => theme.spacing(0.5)};
    color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledAutoAwesomeIcon = styled(AutoAwesomeIcon)`
    color: #AD46FF;
`

export const StyledCircularProgress = styled(CircularProgress)`
    color: #AD46FF;
`