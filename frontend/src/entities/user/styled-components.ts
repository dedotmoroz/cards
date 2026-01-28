import { styled } from "@mui/material/styles";
import { Box, DialogActions, DialogTitle  } from "@mui/material";


export const StyledLabel = styled(Box)`
    font-size: 14px;
    padding: 16px 0 8px;
    color: #6A7282;
`

export const StyledDialogActions = styled(DialogActions)`
    padding: 20px 24px 0 24px;
    margin-left: 30%;
    gap: 16px;

    /* override MUI default spacing between actions */
    & > :not(style) ~ :not(style) {
        margin-left: 0;
    }

    ${({ theme }) => theme.breakpoints.down('md')} {
        width: 100%;
        margin-left: 0;
        flex-direction: column-reverse;
        align-items: stretch;
        gap: 12px;
        padding: 20px 24px 0 24px;
    }
`

export const StyledRegisterBox = styled(Box)`
    text-align: right;
    padding: 30px 24px 30px 24px;

    ${({ theme }) => theme.breakpoints.down('md')} {
        text-align: center;
    }
`

export const StyledDialogTitle = styled(DialogTitle)`
    font-size: 24px;
    text-align: center;
    font-weight: 600;
`