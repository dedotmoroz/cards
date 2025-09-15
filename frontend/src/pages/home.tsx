import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { FolderList } from '@/widgets/folder-list';
import { CardList } from '@/widgets/card-list';
import { CreateFolderDialog } from '@/features/create-folder';
import { CreateCardDialog } from '@/features/create-card';
import { LearnSection } from '@/widgets/learn-section';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useCreateFolder } from '@/features/create-folder/useCreateFolder';
import { useCreateCard } from '@/features/create-card/useCreateCard';

export const HomePage = () => {
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [isLearning, setIsLearning] = useState(false);

    const { 
        folders, 
        cards, 
        selectedFolderId,
        isLoading,
        setSelectedFolder,
        fetchFolders,
        fetchCards
    } = useCardsStore();
    
    const { createFolder } = useCreateFolder();
    const { createCard } = useCreateCard();

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

    const handleStartLearning = () => {
        setIsLearning(true);
    };

    const handleCreateFolder = async (name: string) => {
        await createFolder(name);
        setIsCreatingFolder(false);
    };

    const handleCreateCard = async (card: { question: string; answer: string; folderId: string }) => {
        if (selectedFolderId) {
            await createCard(selectedFolderId, card.question, card.answer);
            setIsCreatingCard(false);
        }
    };

    return (
        <Grid container spacing={2} sx={{ height: '100vh', p: 2 }}>
            <Grid item xs={3}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6">Папки</Typography>
                    <FolderList
                        folders={folders}
                        selectedId={selectedFolderId}
                        onSelect={setSelectedFolder}
                    />
                    <Button fullWidth sx={{ mt: 2 }} onClick={() => setIsCreatingFolder(true)}>
                        Добавить папку
                    </Button>
                </Paper>
            </Grid>

            <Grid item xs={9}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Карточки</Typography>
                        <Box>
                            <Button
                                onClick={() => setIsCreatingCard(true)}
                                sx={{ mr: 2 }}
                                variant="outlined"
                                disabled={!selectedFolderId}
                            >
                                Добавить карточку
                            </Button>
                            <Button
                                onClick={handleStartLearning}
                                variant="contained"
                                disabled={!selectedFolderId || cards.length === 0}
                            >
                                Учить
                            </Button>
                        </Box>
                    </Box>

                    {isLoading ? (
                        <Box mt={4} display="flex" justifyContent="center">
                            <CircularProgress />
                        </Box>
                    ) : isLearning ? (
                        <LearnSection cards={cards} onExit={() => setIsLearning(false)} />
                    ) : (
                        <CardList cards={cards} />
                    )}
                </Paper>
            </Grid>

            <CreateFolderDialog
                open={isCreatingFolder}
                onClose={() => setIsCreatingFolder(false)}
                onCreate={handleCreateFolder}
            />

            {selectedFolderId && (
                <CreateCardDialog
                    open={isCreatingCard}
                    folderId={selectedFolderId}
                    onClose={() => setIsCreatingCard(false)}
                    onCreate={handleCreateCard}
                />
            )}
        </Grid>
    );
};