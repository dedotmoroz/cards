import { styled } from "@mui/material/styles";
import { Grid, Box } from "@mui/material";

export const StyledGrid = styled(Grid)`
    height: calc(100vh - 64px);
    padding: 80px 10px 10px;
`
export const StyledWrapperBox = styled(Box)`
    padding: 20px;
    height: 100%;
`
export const StyledTopBox = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`
export const StyleLeftBox = styled(Box)`
    display: flex;
    align-items: flex-start;
`

export const StyledHeaderBox = styled(Box)`
    display: flex;
    align-items: center;
    gap: 2;
`