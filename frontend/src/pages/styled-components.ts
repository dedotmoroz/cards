import { styled } from "@mui/material/styles";
import { Grid, Box, Container } from "@mui/material";

export const StyledGrid = styled(Grid)`
    height: calc(100vh - 64px);
    padding: 80px 10px 10px;
`

export const StyledMobileVersionBox = styled(Box)`
    display: flex; 
    min-height: 100vh;
    padding: 50px 0 10px 0;
`

export const StyledCardsBox = styled(Box)`
    flex-grow: 1;
    padding: 10px;
    width: 100%;
    overflow: auto;
`

export const StyledLogoPlace = styled(Box)`
    margin-left: 20px;
    margin-top: 20px;
`

export const StyledLandingContainer = styled(Box)`
    min-height: 100vh;
    padding-bottom: 40px;
    background: linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 50%, #FDF2F8 100%);
    position: relative;
`
export const StyledHeadlineContainer = styled(Container)(({ theme }) => ({
    paddingTop: '80px',
    [theme.breakpoints.down('md')]: {
        paddingTop: '40px',
    },
}));