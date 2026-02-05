import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledLearningWrapper = styled(Box)`
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: start;
`
export const StyledCardFlipBox = styled(Box)`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
`

export const StyledNavigationBox = styled(Box)`
    display: flex;
    position: relative;
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 0;
    margin-top: 30px;
    margin-bottom: 30px;

    @media (max-height: 599px) {
        margin-bottom: -20px;
    }
`

export const StyledLearningControls = styled(Box)`
    margin-bottom: 50px;
    margin-top: 20px;
    position: relative;
`