import { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Logout, Person, AccountCircle } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { StyledUserCard, StyledAvatar } from './styled-components';

export const UserProfile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleClose();
        navigate('/profile');
    };

    const logoutHandler = async () => {
        handleClose();
        await logout();
        navigate('/');
    };

    if (user) {
        return (
            <>
                <StyledUserCard onClick={handleClick}>
                    <Typography
                        variant="body2"
                        sx={{ color: '#000' }}
                    >
                        {user.username}
                    </Typography>
                    <StyledAvatar><AccountCircle fontSize={'large'} /></StyledAvatar>
                </StyledUserCard>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('home.profile')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={logoutHandler}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('auth.logout')}</ListItemText>
                    </MenuItem>
                </Menu>
            </>
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

