import { styled } from '@mui/material/styles';
import { Card, Typography, CardContent } from '@mui/material';

export const StyledCardBox = styled(Card)`
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transform: rotateY(0deg);
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 24px;
    border: 1px solid #F3F4F6;
    background: linear-gradient(135deg, #FFF 0%, #F9FAFB 100%);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    
    &:hover {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
`;

interface StyledCardTypographyProps {
    $fontSize?: string;
}

export const StyledCardContent = styled(CardContent)`
    width: 100%;
    text-align: center;
    padding: 32px;
`;

export const StyledCardTypography = styled(Typography)<StyledCardTypographyProps>`
    margin-bottom: 24px;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    ${({ $fontSize }) => $fontSize && `font-size: ${$fontSize};`}
`;

export const StyledEmptyCardPlace = styled(Card)`
    height: 300px;
    width: 500px;
    box-shadow: none;
    border-radius: 20px;
    background: linear-gradient(90deg, rgba(224, 231, 255, 0.60) 0%, rgba(243, 232, 255, 0.60) 50%, rgba(252, 231, 243, 0.60) 100%);
`;

