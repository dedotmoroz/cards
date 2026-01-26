import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, TextField } from "@mui/material";
import { AccountCircle } from '@mui/icons-material';

// Wrapper и Container для страницы профиля
export const StyledProfileWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

export const StyledProfileContainer = styled(Box)`
    width: 100%;
    max-width: 670px;
    padding: 10px;
`;

// Группировка секций формы
export const StyledGroupBox = styled(Box)`
    // border: 1px solid ${({ theme }) => theme.palette.divider};
    padding: 12px 25px 25px;
    border-radius: 16px;
    margin-bottom: 40px;
    
    border: 1px solid #F3F4F6;
    background: #FFF;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.10);
`;

// Paper для форм
export const StyledFormPaper = styled(Paper)`
    margin-top: 16px;
    padding: 32px;
    background: linear-gradient(156deg, #FFF 8.54%, #F9FAFB 91.46%), #FFF;
    backdrop-filter: blur(10px);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

// Header секция с иконкой и заголовком
export const StyledHeaderBox = styled(Box)`
    text-align: center;
    margin-bottom: 32px;
`;

export const StyledHeaderIcon = styled(AccountCircle)`
    font-size: 48px;
    color: ${({ theme }) => theme.palette.primary.main};
    margin-bottom: 16px;
`;

export const StyledSectionTitle = styled(Typography)`
    font-weight: 600;
`;

// Кнопки
export const StyledButtonBox = styled(Box)`
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
`;

export const StyledButtonsRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

// Token TextField
export const StyledTokenField = styled(TextField)`
`;

// Навигация (header с кнопкой назад)
export const StyledNavigationBox = styled(Box)`
    padding-top: 0;
    padding-bottom: 0;
`;

export const StyledNavigationInner = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

// Контейнер для формы
export const StyledFormContainer = styled(Box)`
    padding-top: 16px;
    padding-bottom: 16px;
`;

// Guest registration specific
export const StyledGuestContainer = styled(Box)`
    padding-top: 32px;
    padding-bottom: 32px;
`;

export const StyledGuestNavigationBox = styled(Box)`
    padding-top: 32px;
    padding-bottom: 32px;
`;

export const StyledTypography = styled(Box)`
    font-size: 20px;
    padding: 16px 0;
`

export const StyledLabel = styled(Box)`
    font-size: 14px;
    padding: 16px 0 8px;
    color: #6A7282;
`