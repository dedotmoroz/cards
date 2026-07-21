import { styled } from '@mui/material/styles';
import { Card, Typography, CardContent, Box } from '@mui/material';

interface StyledCardBoxProps {
    $swipeDirection?: 'left' | 'right' | null;
}

const getCardBackground = (direction: 'left' | 'right' | null | undefined) => {
    if (direction === 'right') {
        return 'var(--gradient-learn-card-know)';
    }
    if (direction === 'left') {
        return 'var(--gradient-learn-card-dont-know)';
    }
    return 'var(--gradient-learn-card)';
};

export const StyledCardBox = styled(Card, {
    shouldForwardProp: (prop) => prop !== '$swipeDirection',
})<StyledCardBoxProps>`
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transform: rotateY(0deg);
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 24px;
    border: 1px solid var(--border-learn-card);
    background: ${({$swipeDirection}) => getCardBackground($swipeDirection)};
    transition: background 0.15s ease;
    box-shadow: var(--shadow-xl);

    &:hover {
        box-shadow: var(--shadow-xl);
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

export const StyledCardTypography = styled(Typography, {
    shouldForwardProp: (prop) => prop !== '$fontSize',
})<StyledCardTypographyProps>`
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
    background: var(--gradient-learn-card-empty);
`;

export const StyledTipBox = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 500px;
    width: 100%;
    text-align: center;
    font-weight: bold;
    min-height: 50px;
`
export const StyleWrapperBox = styled(Box)`
  position: relative;
`

export const StyledSecondContextBox = styled(Box)`
    display: flex;
    justify-content: center;

    @media (max-height: 599px) {
        margin-top: -20px;
    }
`
