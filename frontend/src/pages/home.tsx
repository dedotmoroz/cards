import { useEffect } from 'react';
import { Box, Grid, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useAuthStore } from '@/shared/store/authStore';
import {Folders} from "@/widgets/folders";
import {Cards} from "@/widgets/cards";

export const HomePage = () => {
    const navigate = useNavigate();

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
    return (
        <>
            <AppBar position="static">
                <Toolbar>
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
            <Grid container spacing={2} sx={{height: 'calc(100vh - 64px)', p: 2}}>
                <Grid size={3}>
                    <Folders/>
                </Grid>
                <Grid size={9}>
                    <Cards/>
                </Grid>
            </Grid>
        </>
        );
    };