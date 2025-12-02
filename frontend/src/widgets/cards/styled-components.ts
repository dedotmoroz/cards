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

export const StyledCardBoxHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(90deg, rgba(224, 231, 255, 0.60) 0%, rgba(243, 232, 255, 0.60) 50%, rgba(252, 231, 243, 0.60) 100%);
    padding: 10px 20px;
    border: 1px solid rgba(255, 255, 255, 0.90);
    border-bottom: none;

    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
`

export const StyledBoxWrapper = styled(Box)`
    background: rgba(255, 255, 255, 0.50);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    overflow: hidden;
`

export const StyledBoxSideA = styled(Box)`
    display: flex;
    width: 100%;
    align-items: center; 
    gap: 10px; 
    flex: 10px
`