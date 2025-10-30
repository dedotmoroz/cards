import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, Button, AppBar, Toolbar, Drawer, IconButton, useMediaQuery, useTheme, Tooltip } from '@mui/material';
import { Menu as MenuIcon, AccountCircle, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useAuthStore } from '@/shared/store/authStore';
import {Folders} from "@/widgets/folders";
import {Cards} from "@/widgets/cards";

export const HomePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const { 
        folders,
        selectedFolderId,
        setSelectedFolder,
        fetchFolders,
        fetchCards,
    } = useCardsStore();
    
    const { user, logout } = useAuthStore();

    // Загружаем папки при монтировании компонента
    useEffect(() => {
        fetchFolders();
    }, []); // Убираем fetchFolders из зависимостей

    // Загружаем карточки при изменении выбранной папки
    useEffect(() => {
        if (selectedFolderId) {
            fetchCards(selectedFolderId);
        }
    }, [selectedFolderId]); // Убираем fetchCards из зависимостей

    // Автоматически выбираем первую папку
    useEffect(() => {
        if (folders.length > 0 && !selectedFolderId) {
            setSelectedFolder(folders[0].id);
        }
    }, [folders, selectedFolderId]); // Убираем setSelectedFolder из зависимостей

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    console.log('user.username', user);
    return (
        <>
            <AppBar position={isMobile ? "relative" : "static"}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    {user ? (
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton color="inherit" size="large">
                                <AccountCircle />
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
                            <Tooltip title={t('home.logout')}>
                                <IconButton color="inherit" onClick={logout} size="large">
                                    <Logout />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Box display="flex" gap={1}>
                            <Button color="inherit" onClick={() => navigate('/signin')}>
                                {t('auth.login')}
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/signup')}>
                                {t('auth.register')}
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            {isMobile ? (
                // Мобильная версия с Drawer
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        sx={{
                            width: 280,
                            '& .MuiDrawer-paper': {
                                width: 280,
                                boxSizing: 'border-box',
                            },
                        }}
                    >
                        <Box sx={{ height: '100%', overflow: 'auto' }}>
                            <Folders />
                        </Box>
                    </Drawer>

                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 1,
                            width: '100%',
                            overflow: 'auto',
                        }}
                    >
                        <Cards />
                    </Box>
                </Box>
            ) : (
                // Оригинальная desktop версия с Grid
                <Grid container spacing={2} sx={{ height: 'calc(100vh - 64px)', p: 2 }}>
                    <Grid size={3}>
                        <Folders />
                    </Grid>
                    <Grid size={9}>
                        <Cards />
                    </Grid>
                </Grid>
            )}
        </>
        );
    };