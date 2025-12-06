import { styled } from "@mui/material/styles";
import { Grid, Box } from "@mui/material";

export const StyledGrid = styled(Grid)`
    height: calc(100vh - 64px);
    padding: 80px 10px 10px;
`

export const StyledMobileVersionBox = styled(Box)`
    display: flex; 
    min-height: 100vh;
    padding: 50px 0 10px 0;
`