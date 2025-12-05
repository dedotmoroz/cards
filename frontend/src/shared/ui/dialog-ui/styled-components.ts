import { Dialog, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDialog = styled(Dialog)`
    & .MuiPaper-root {
        border-radius: 18px;
        padding: 10px;
        min-width: 400px;
    }
`;

export const StyledDialogActions = styled(DialogActions)`
    padding: 0 24px 24px 24px;
`;

