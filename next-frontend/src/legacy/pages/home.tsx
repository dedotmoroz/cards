import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppNavigate } from '@/shared/libs/use-app-navigate';
import { Box, Grid, Drawer, useMediaQuery, useTheme } from '@mui/material';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useFoldersStore, REMEMBER_VIRTUAL_MIN_TOTAL_CARDS } from '@/shared/store/foldersStore';
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
    const { userId, folderId, kind } = useParams<{ userId?: string; folderId?: string; kind?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const highlightCardId = searchParams.get('cardId');
    const navigate = useAppNavigate();
    const { user } = useAuthStore();
    const currentUserId = user?.id;

    const { fetchCards, fetchVirtualCards, isLoading: cardsLoading } = useCardsStore();
    const {
        folders,
        rememberEligibleCount,
        hardEligibleCount,
        selectedFolderId,
        setSelectedFolder,
        fetchFolders,
    } = useFoldersStore();

    // Получаем название папки для title
    const folderName = useMemo(() => {
        const currentFolderId = kind ? `virtual:${kind}` : (folderId || selectedFolderId);
        if (!currentFolderId) {
            return null;
        }
        if (currentFolderId === 'virtual:remember') return t('folders.virtual.remember', 'Вспомни');
        if (currentFolderId === 'virtual:hard') return t('folders.virtual.hard', 'Сложно');
        const folder = folders.find((item) => item.id === currentFolderId);
        return folder?.name ?? null;
    }, [folderId, selectedFolderId, folders, kind, t]);

    // Формируем title страницы
    const pageTitle = useMemo(() => {
        const baseTitle = 'KotCat';
        return folderName ? `${baseTitle} - ${folderName}` : baseTitle;
    }, [folderName]);


    // Используем ref для отслеживания последнего загруженного folderId, чтобы избежать повторных загрузок
    const lastFetchedFolderId = useRef<string | null>(null);

    // Загружаем папки при монтировании компонента
    useEffect(() => {
        fetchFolders();
    }, []); // Убираем fetchFolders из зависимостей

    // Синхронизируем store с URL (userId и folderId - источники истины)
    useEffect(() => {
        if (userId && kind) {
            const virtualId = `virtual:${kind}`;
            if (virtualId !== selectedFolderId) {
                setSelectedFolder(virtualId);
            }
        } else if (userId && folderId) {
            // Если в URL есть userId и folderId, устанавливаем folderId как выбранную папку
            if (folderId !== selectedFolderId) {
                setSelectedFolder(folderId);
            }
        } else if (userId && !folderId && !kind && folders.length > 0) {
            // Если в URL есть userId, но нет folderId, редиректим на первую папку
            navigate(`/learn/${userId}/${folders[0].id}`, { replace: true });
        } else if (!userId && currentUserId && folders.length > 0) {
            // Если в URL нет userId, но есть текущий пользователь, добавляем userId в URL
            if (selectedFolderId) {
                if (selectedFolderId.startsWith('virtual:')) {
                    const k = selectedFolderId.replace(/^virtual:/, '');
                    navigate(`/learn/${currentUserId}/virtual/${k}`, { replace: true });
                } else {
                    navigate(`/learn/${currentUserId}/${selectedFolderId}`, { replace: true });
                }
            } else {
                navigate(`/learn/${currentUserId}/${folders[0].id}`, { replace: true });
            }
        } else if (!userId && !currentUserId && folders.length > 0) {
            // Если нет ни userId, ни текущего пользователя, редиректим на /learn
            navigate('/learn', { replace: true });
        }
    }, [userId, folderId, kind, folders, selectedFolderId, setSelectedFolder, navigate, currentUserId]);

    // «Вспомни» скрываем при <10 карточек всего; уводим с URL, если папка недоступна
    useEffect(() => {
        if (kind !== 'remember' || !userId || folders.length === 0) return;
        if (rememberEligibleCount === null) return;
        if (rememberEligibleCount >= REMEMBER_VIRTUAL_MIN_TOTAL_CARDS) return;
        navigate(`/learn/${userId}/${folders[0].id}`, { replace: true });
    }, [kind, userId, folders, rememberEligibleCount, navigate]);

    // «Сложно» скрываем при 0 карточках в выборке
    useEffect(() => {
        if (kind !== 'hard' || !userId || folders.length === 0) return;
        if (hardEligibleCount === null) return;
        if (hardEligibleCount > 0) return;
        navigate(`/learn/${userId}/${folders[0].id}`, { replace: true });
    }, [kind, userId, folders, hardEligibleCount, navigate]);

    // Отдельный useEffect для загрузки карточек, зависит только от folderId
    useEffect(() => {
        if (userId && kind) {
            const virtualId = `virtual:${kind}`;
            if (virtualId !== lastFetchedFolderId.current) {
                lastFetchedFolderId.current = virtualId;
                if (kind === 'remember' || kind === 'hard') {
                    fetchVirtualCards(kind, 10);
                }
            }
            return;
        }
        if (userId && folderId && folderId !== lastFetchedFolderId.current) {
            lastFetchedFolderId.current = folderId;
            fetchCards(folderId);
        }
    }, [userId, folderId, kind, fetchCards, fetchVirtualCards]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useSEO({
        title: pageTitle,
        description: t('seo.learn.description'),
        keywords: t('seo.keywords'),
        lang: i18n.language
    });

    const goToHome = () => {
        navigate('/');
    }

    const handleHighlightComplete = useCallback(() => {
        if (!searchParams.get('cardId')) return;
        const next = new URLSearchParams(searchParams);
        next.delete('cardId');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);


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
                            <Cards
                                isLoading={cardsLoading}
                                highlightCardId={highlightCardId}
                                onHighlightComplete={handleHighlightComplete}
                            />
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
                                <Logo
                                    handle={handleDrawerToggle}
                                    handleGoMain={goToHome}
                                />
                            </StyledLogoPlace>
                            <Folders onFolderSelect={handleDrawerToggle} />
                        </Box>
                    </Drawer>
                    <StyledCardsBox>
                        <Cards
                            isLoading={cardsLoading}
                            highlightCardId={highlightCardId}
                            onHighlightComplete={handleHighlightComplete}
                        />
                    </StyledCardsBox>
                </StyledMobileVersionBox>
            )}
        </>
        );
    };