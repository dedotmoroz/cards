import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, AppBar, Toolbar, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useAuthStore } from '@/shared/store/authStore';
import {Folders} from "@/widgets/folders";
import {Cards} from "@/widgets/cards";

export const HomePage = () => {
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
    }, [fetchFolders]);

    // Загружаем карточки при изменении выбранной папки
    useEffect(() => {
        if (selectedFolderId) {
            fetchCards(selectedFolderId);
        }
    }, [selectedFolderId, fetchCards]);

    // Автоматически выбираем первую папку
    useEffect(() => {
        if (folders.length > 0 && !selectedFolderId) {
            setSelectedFolder(folders[0].id);
        }
    }, [folders, selectedFolderId, setSelectedFolder]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    return (
        <>
            <AppBar position="static">
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
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Карточки для изучения
                    </Typography>
                    {user ? (
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="body2">
                                Привет, {user.username}!
                            </Typography>
                            <Button color="inherit" onClick={logout}>
                                Выйти
                            </Button>
                        </Box>
                    ) : (
                        <Box display="flex" gap={1}>
                            <Button color="inherit" onClick={() => navigate('/signin')}>
                                Войти
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/signup')}>
                                Регистрация
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            {isMobile ? (
                // Мобильная версия с Drawer
                <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
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