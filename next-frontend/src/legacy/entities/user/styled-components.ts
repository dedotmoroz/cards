import { styled } from "@mui/material/styles";
import { Box, DialogTitle  } from "@mui/material";

export const StyledLabel = styled(Box)`
    font-size: 14px;
    padding: 16px 0 8px;
    color: #6A7282;
`
export const StyledDialogActions = styled(Box)`
    display: flex;
    flex-direction: column;
    padding: 10px 24px 0 24px;
    gap: 16px;
`
export const StyledRegisterBox = styled(Box)`
    text-align: center;
    padding: 30px 24px 30px 24px;
`
export const StyledDialogTitle = styled(DialogTitle)`
    font-size: 24px;
    text-align: center;
    font-weight: 600;
`;

export const StyledNavigationBox = styled(Box)`
    padding-top: 0;
    padding-bottom: 0;
`;

export const StyledNavigationInner = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;