import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Drawer, useMediaQuery, useTheme} from '@mui/material';

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

import { StyledGrid, StyledMobileVersionBox, StyledCardsBox, StyledLogoPlace } from './styled-components.ts'
import {Logo} from "@/shared/ui";

export const HomePage = () => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { folderId } = useParams<{ folderId?: string }>();
    const navigate = useNavigate();

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

    // Синхронизируем URL с выбранной папкой
    useEffect(() => {
        if (folderId && folderId !== selectedFolderId) {
            // Если в URL есть folderId, устанавливаем его как выбранную папку
            setSelectedFolder(folderId);
        } else if (!folderId && folders.length > 0 && selectedFolderId) {
            // Если в URL нет folderId, но есть выбранная папка, обновляем URL
            navigate(`/learn/${selectedFolderId}`, { replace: true });
        } else if (!folderId && folders.length > 0 && !selectedFolderId) {
            // Если в URL нет folderId и нет выбранной папки, редиректим на первую папку
            navigate(`/learn/${folders[0].id}`, { replace: true });
        }
    }, [folderId, folders, selectedFolderId, setSelectedFolder, navigate]);

    // Загружаем карточки при изменении выбранной папки
    useEffect(() => {
        if (selectedFolderId) {
            fetchCards(selectedFolderId);
        }
    }, [selectedFolderId]); // Убираем fetchCards из зависимостей

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
                selectSide={<SelectSide />}
                learnWordsButton={<LearnWordsButton />}
                learnPhrasesButton={<LearnPhrasesButton />}
                learnWordsMoreButton={<LearnWordsMoreButton />}
                onDrawerToggle={handleDrawerToggle}
            />
            {!isMobile ?
                (
                    /**
                     * Оригинальная desktop версия с Grid
                     */
                    <StyledGrid container spacing={1}>
                        <Grid size={3}>
                            <Folders />
                        </Grid>
                        <Grid size={9}>
                            <Cards />
                        </Grid>
                    </StyledGrid>
                ) : (
                /**
                 * Мобильная версия с Drawer
                 */
                <StyledMobileVersionBox>
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
                            <StyledLogoPlace>
                                <Logo handle={handleDrawerToggle}  />
                            </StyledLogoPlace>
                            <Folders />
                        </Box>
                    </Drawer>
                    <StyledCardsBox>
                        <Cards />
                    </StyledCardsBox>
                </StyledMobileVersionBox>
            )}
        </>
        );
    };