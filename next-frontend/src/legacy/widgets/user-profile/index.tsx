import { useState } from 'react';
import { Box, Typography, Button, MenuItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Logout, Person, LightMode, DarkMode } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/shared/libs/use-app-navigate';
import { useAuthStore } from '@/shared/store/authStore';
import { useThemeStore } from '@/shared/store/themeStore';
import { StyledUserCard, StyledAvatar, StyledAccountCircle } from './styled-components';
import { MenuUI } from '@/shared/ui/menu-ui';

export const UserProfile = () => {
    const { t } = useTranslation();
    const navigate = useAppNavigate();
    const { user, logout } = useAuthStore();
    const themeMode = useThemeStore((s) => s.mode);
    const setThemeMode = useThemeStore((s) => s.setMode);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

    const handleThemeToggle = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
        handleClose();
    };

    const logoutHandler = async () => {
        handleClose();
        await logout();
        navigate('/');
    };

    const nextThemeIsDark = themeMode === 'light';

    if (user) {
        return (
            <>
                <StyledUserCard onClick={handleClick}>
                    { !isMobile && <Typography
                        variant="body2"
                        sx={{ color: 'var(--text-default)' }}
                    >
                        {user.username}
                    </Typography>}
                    <StyledAvatar>
                        <StyledAccountCircle />
                    </StyledAvatar>
                </StyledUserCard>
                <MenuUI
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
                    <MenuItem onClick={handleThemeToggle}>
                        <ListItemIcon>
                            {nextThemeIsDark ? (
                                <DarkMode fontSize="small" />
                            ) : (
                                <LightMode fontSize="small" />
                            )}
                        </ListItemIcon>
                        <ListItemText>
                            {nextThemeIsDark ? t('theme.dark') : t('theme.light')}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={logoutHandler}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('auth.logout')}</ListItemText>
                    </MenuItem>
                </MenuUI>
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
