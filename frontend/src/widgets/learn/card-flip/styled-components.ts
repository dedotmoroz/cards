import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

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

