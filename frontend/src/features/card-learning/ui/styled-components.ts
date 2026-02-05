import { styled } from '@mui/material/styles';
import { Button, Typography, Box } from '@mui/material';

export const StyledDontKnowButton = styled(Button)`
    border-radius: 14px;
    background: linear-gradient(90deg, #FB2C36 0%, #E7000B 100%);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
    min-width: 120px;

    max-width: 230px;
    height: 56px;
    flex-shrink: 0;

    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    
    &:disabled {
        transform: scale(0.95);
    }
    
    &:not(:disabled) {
        transform: scale(1);
    }
    
    transition: transform 0.2s ease;
`;

export const StyledKnowButton = styled(Button)`
    border-radius: 14px;
    background: linear-gradient(90deg, #00C950 0%, #00A63E 100%);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
    min-width: 120px;

    max-width: 230px;
    height: 56px;
    flex-shrink: 0;

    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    
    &:disabled {
        transform: scale(0.95);
    }
    
    &:not(:disabled) {
        transform: scale(1);
    }
    
    transition: transform 0.2s ease;
`;

export const StyledUnlearnedCount = styled(Typography)`
    text-align: center;
    color: #FB2C36;
    font-weight: bold;
`;

export const StyledLearnedCount = styled(Typography)`
    text-align: center;
    color: #00C950;
    font-weight: bold;
`;

export const StyledAudioBlock = styled(Box)`
    position: relative;
    z-index: 50;
    width: 100%;
    display: flex; 
    justify-content: center; 
    margin-top: 15px;
    margin-bottom: -55px;
`

export const StyledCardCount = styled(Box)`
font-size: 18px;
`


