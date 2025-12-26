import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Drawer, useMediaQuery, useTheme} from '@mui/material';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useAuthStore } from '@/shared/store/authStore';
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
    const { userId, folderId } = useParams<{ userId?: string; folderId?: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const currentUserId = user?.id;

    const { fetchCards } = useCardsStore();
    const {
        folders,
        selectedFolderId,
        setSelectedFolder,
        fetchFolders,
    } = useFoldersStore();

    // Получаем название папки для title
    const folderName = useMemo(() => {
        const currentFolderId = folderId || selectedFolderId;
        if (!currentFolderId) {
            return null;
        }
        const folder = folders.find((item) => item.id === currentFolderId);
        return folder?.name ?? null;
    }, [folderId, selectedFolderId, folders]);

    // Формируем title страницы
    const pageTitle = useMemo(() => {
        const baseTitle = 'KotCat';
        return folderName ? `${baseTitle} - ${folderName}` : baseTitle;
    }, [folderName]);


    // Загружаем папки при монтировании компонента
    useEffect(() => {
        fetchFolders();
    }, []); // Убираем fetchFolders из зависимостей

    // Синхронизируем store с URL (userId и folderId - источники истины)
    useEffect(() => {
        if (userId && folderId) {
            // Если в URL есть userId и folderId, устанавливаем folderId как выбранную папку
            if (folderId !== selectedFolderId) {
                setSelectedFolder(folderId);
            }
            // Загружаем карточки для этой папки
            fetchCards(folderId);
        } else if (userId && !folderId && folders.length > 0) {
            // Если в URL есть userId, но нет folderId, редиректим на первую папку
            navigate(`/learn/${userId}/${folders[0].id}`, { replace: true });
        } else if (!userId && currentUserId && folders.length > 0) {
            // Если в URL нет userId, но есть текущий пользователь, добавляем userId в URL
            if (selectedFolderId) {
                navigate(`/learn/${currentUserId}/${selectedFolderId}`, { replace: true });
            } else {
                navigate(`/learn/${currentUserId}/${folders[0].id}`, { replace: true });
            }
        } else if (!userId && !currentUserId && folders.length > 0) {
            // Если нет ни userId, ни текущего пользователя, редиректим на /learn
            navigate('/learn', { replace: true });
        }
    }, [userId, folderId, folders, selectedFolderId, setSelectedFolder, navigate, fetchCards, currentUserId]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useSEO({
        title: pageTitle,
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