import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';

export const UserProfile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const logoutHandler = async () => {
        await logout();
        navigate('/');
    };

    if (user) {
        return (
            <Box display="flex" alignItems="center" gap={2}>
                <Tooltip title={t('profile.openProfile')}>
                    <Box display="flex" alignItems="center">
                        <IconButton color="inherit" size="large" onClick={() => navigate('/profile')}>
                            <AccountCircle/>
                        </IconButton>
                        <Typography
                            variant="body2"
                            sx={{
                                maxWidth: '50px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {user.username}
                        </Typography>
                    </Box>
                </Tooltip>

                <Tooltip title={t('home.logout')}>
                    <IconButton color="inherit" onClick={logoutHandler} size="large">
                        <Logout />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    return (
        <Box display="flex" gap={1}>
            <Button color="inherit" onClick={() => navigate('/signin')}>
                {t('auth.login')}
            </Button>
            <Button color="inherit" onClick={() => navigate('/signup')}>
                {t('auth.register')}
            </Button>
        </Box>
    );
};

