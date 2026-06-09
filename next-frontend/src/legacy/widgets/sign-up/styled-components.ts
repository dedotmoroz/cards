import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

export const StyledSignUpWrapper = styled(Box)`
    width: 100%;
    padding-top: 10px;
`;

export const StyledSignUpHeader = styled(Box)`
    padding: 32px 0;
`;

export const StyledSignUpHeaderInner = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const StyledSignUpFormSection = styled(Box)`
    padding: 16px 0 32px;
`;

export const StyledSignUpPaper = styled(Paper)(({ theme }) => ({
    padding: '32px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('md')]: {
        padding: '16px',
    },
}));

export const StyledSignUpHeaderBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: '32px',
    [theme.breakpoints.down('md')]: {
        marginBottom: '16px',
    },
}));

export const StyledSignUpIcon = styled(PersonAdd)`
    font-size: 48px;
    color: ${({ theme }) => theme.palette.primary.main};
    margin-bottom: 16px;
`;

export const StyledSignUpTitle = styled(Typography)`
    font-weight: 600;
`;

export const StyledSignUpFooter = styled(Box)`
    text-align: center;
`;

export const StyledTurnStileBox = styled(Box)`
    margin-top: 30px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`
