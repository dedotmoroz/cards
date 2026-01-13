import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

export const StyledContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 50px;

    border-radius: 24px;
    border: 1px solid #F3F4F6;
    background: linear-gradient(156deg, #FFF 8.54%, #F9FAFB 91.46%);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`
export const StyledTypography = styled(Typography)`
    color: #99A1AF;
`
export const StyledHeaderTypography  = styled(Typography)`
`
export const StyledGreenBox = styled(Box)`
    width: 12px; 
    height: 12px; 
    border-radius: 50%;
    background: #00C950;
`
export const StyledRedBox = styled(Box)`
    width: 12px; 
    height: 12px; 
    border-radius: 50%;
    background: #FB2C36;
`

export const StyledBoxExternal = styled(Box)`
    margin-top: 40px;
    width: 180px;
    height: 180px;
    border-radius: 50%;,
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`

export const StyledBoxInterior = styled(Box)`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`

export const StyledPercentTypography = styled(Typography)`
`

export const StyledLearnedCount = styled(Box)`
    color: #364153;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 27px;
    margin-top: 24px;
`

export const StyledContinueLearningButton = styled(Button)`
    display: flex;
    padding: 15px 30px;
    justify-content: center;
    align-items: center;
    border-radius: 14px;
    background: linear-gradient(90deg, #615FFF 0%, #F6339A 100%);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
    width: 100%;
`

export const StyledBackButton = styled(Button)`
    display: flex;
    padding: 15px 30px;
    justify-content: center;
    align-items: center;
    border-radius: 14px;
    border: 1px solid #E5E7EB;
    background: #FFF;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    color: #364153;
    width: 100%;
`

export const StyledStackBox = styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
    width: 100%;
`