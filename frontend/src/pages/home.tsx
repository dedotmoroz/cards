import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FolderList } from '@/widgets/folder-list';
import { CardList } from '@/widgets/card-list';
import { CreateFolderDialog } from '@/features/create-folder';
import { CreateCardDialog } from '@/features/create-card';
import { ImportCardsDialog } from '@/features/import-cards/import-cards-dialog';

import { useCardsStore } from '@/shared/store/cardsStore';
import { useCreateFolder } from '@/features/create-folder/useCreateFolder';
import { useCreateCard } from '@/features/create-card/useCreateCard';
import { useImportCards } from '@/features/import-cards/useImportCards';

export const HomePage = () => {
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [isImportingCards, setIsImportingCards] = useState(false);
    const navigate = useNavigate();

    const { 
        folders, 
        cards, 
        selectedFolderId,
        isLoading,
        setSelectedFolder,
        fetchFolders,
        fetchCards,
        updateFolderName,
        deleteFolder
    } = useCardsStore();
    
    const { createFolder } = useCreateFolder();
    const { createCard } = useCreateCard();
    const { importCards } = useImportCards();

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
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}`);
        }
    };

    const handleStartLearningUnlearned = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?mode=unlearned`);
        }
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

    const handleImportCards = async (cards: { question: string; answer: string }[]) => {
        if (selectedFolderId) {
            await importCards(selectedFolderId, cards);
            setIsImportingCards(false);
        }
    };

    return (
        <Grid container spacing={2} sx={{ height: '100vh', p: 2 }}>
            <Grid size={3}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6">Папки</Typography>
                    <Button fullWidth sx={{ mt: 2 }} onClick={() => setIsCreatingFolder(true)}>
                        Добавить папку
                    </Button>
                    <FolderList
                        folders={folders}
                        selectedId={selectedFolderId}
                        onSelect={setSelectedFolder}
                        onRename={updateFolderName}
                        onDelete={deleteFolder}
                    />
                </Paper>
            </Grid>

            <Grid size={9}>
                <Paper sx={{ p: 2, height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                Карточки {cards.length > 0 && `(${cards.length})`}
                            </Typography>
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
                                onClick={() => setIsImportingCards(true)}
                                sx={{ mr: 2 }}
                                variant="outlined"
                                color="secondary"
                                disabled={!selectedFolderId}
                            >
                                Импортировать
                            </Button>
                            <Button
                                onClick={handleStartLearning}
                                sx={{ mr: 2 }}
                                variant="contained"
                                disabled={!selectedFolderId || cards.length === 0}
                            >
                                Учить все
                            </Button>
                            <Button
                                onClick={handleStartLearningUnlearned}
                                variant="contained"
                                color="secondary"
                                disabled={!selectedFolderId || cards.length === 0}
                            >
                                Учить выбранные
                            </Button>
                        </Box>
                    </Box>

                    {isLoading ? (
                        <Box mt={4} display="flex" justifyContent="center">
                            <CircularProgress />
                        </Box>
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

            {selectedFolderId && (
                <ImportCardsDialog
                    open={isImportingCards}
                    folderId={selectedFolderId}
                    onClose={() => setIsImportingCards(false)}
                    onImport={handleImportCards}
                />
            )}
        </Grid>
    );
};