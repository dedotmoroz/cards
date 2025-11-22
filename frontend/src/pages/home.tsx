import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Drawer, IconButton, useMediaQuery, useTheme} from '@mui/material';
import { Pets } from '@mui/icons-material';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useFoldersStore } from '@/shared/store/foldersStore';
import {Folders} from "@/widgets/folders";
import {Cards} from "@/widgets/cards";
import { useSEO } from '@/shared/hooks/useSEO';
import { HeaderToolbar } from '@/shared/ui/header';
import { LearnWordsButton } from '@/features/learn-words';
import { LearnPhrasesButton } from '@/features/learn-phrases';
import { LearnWordsMoreButton } from '@/features/learn-words-more';
import { SelectSide } from '@/features/select-side';

import styles from './style.module.css'

export const HomePage = () => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const { fetchCards } = useCardsStore();
    const {
        folders,
        selectedFolderId,
        setSelectedFolder,
        fetchFolders,
    } = useFoldersStore();


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

    useSEO({
        title: t('seo.learn.title'),
        description: t('seo.learn.description'),
        keywords: t('seo.keywords'),
        lang: i18n.language
    });

    return (
        <>
            <HeaderToolbar 
                learnWordsButton={<LearnWordsButton />}
                learnPhrasesButton={<LearnPhrasesButton />}
                learnWordsMoreButton={<LearnWordsMoreButton />}
                selectSide={<SelectSide />}
            />
            {!isMobile ?
                (
                    /**
                     * Оригинальная desktop версия с Grid
                     */
                    <Grid container spacing={1} className={styles.desktopLayout}>
                        <Grid size={3}>
                            <Folders />
                        </Grid>
                        <Grid size={9}>
                            <Cards />
                        </Grid>
                    </Grid>
                ) : (
                /**
                 * Мобильная версия с Drawer
                 */
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
                            <IconButton
                                color="inherit"
                                aria-label={t('navigation.home')}
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ml: 2, mt: 2}}
                            >
                                <Pets/>
                            </IconButton>
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
            )}
        </>
        );
    };