import {Box, Button, CircularProgress, Paper, Typography, IconButton, Menu, MenuItem} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {CardList} from "@/widgets/cards/card-list.tsx";
import {useState} from "react";
import {useCardsStore} from "@/shared/store/cardsStore.ts";
import {useCreateCard} from "@/features/create-card/useCreateCard.ts";
import {useNavigate} from "react-router-dom";
import {CreateCardDialog} from "@/features/create-card.tsx";
import {ImportCardsDialog} from "@/features/import-cards/import-cards-dialog.tsx";
import {useImportCards} from "@/features/import-cards/useImportCards.ts";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import GetAppIcon from '@mui/icons-material/GetApp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';


export const Cards = () => {
    const { t } = useTranslation();
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [isImportingCards, setIsImportingCards] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [displayFilter, setDisplayFilter] = useState<'A' | 'AB' | 'B'>('AB');
    const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const { importCards } = useImportCards();

    const {
        cards,
        selectedFolderId,
        isLoading,
        updateCardLearnStatus,
    } = useCardsStore();

    const { createCard } = useCreateCard();
    const navigate = useNavigate();

    const handleCreateCard = async (card: { question: string; answer: string; folderId: string }) => {
        if (selectedFolderId) {
            await createCard(selectedFolderId, card.question, card.answer);
            setIsCreatingCard(false);
        }
    };

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

    const handleImportCards = async (cards: { question: string; answer: string }[]) => {
        if (selectedFolderId) {
            await importCards(selectedFolderId, cards);
            setIsImportingCards(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleImportClick = () => {
        setIsImportingCards(true);
        handleMenuClose();
    };

    const handleFilterChange = (newFilter: 'A' | 'AB' | 'B') => {
        console.log('handleFilterChange called with:', newFilter);
        setDisplayFilter(newFilter);
    };

    const handleUnlearnedToggle = () => {
        setShowOnlyUnlearned(!showOnlyUnlearned);
    };

    const handleSelectAllChange = async (isChecked: boolean) => {
        setSelectAll(isChecked);
        
        // Массово обновляем статус всех карточек
        for (const card of cards) {
            await updateCardLearnStatus(card.id, isChecked);
        }
    };

    return(
        <>
            <Paper sx={{p: 2, height: '100%'}}>
                <Box display="flex" justifyContent="flex-end" alignItems="center">
                    <Box>
                        <Button
                            onClick={handleStartLearning}
                            sx={{mr: 2}}
                            variant="contained"
                            disabled={!selectedFolderId || cards.length === 0}
                        >
                            {t('buttons.startLearning')}
                        </Button>
                        <Button
                            onClick={handleStartLearningUnlearned}
                            variant="contained"
                            color="secondary"
                            disabled={!selectedFolderId || cards.length === 0}
                        >
                            {t('learning.wantToContinue')}
                        </Button>
                    </Box>
                </Box>

                <Box display="flex" alignItems="center">
                    <Typography variant="h6">
                        {t('cards.title')} {cards.length > 0 && `(${cards.length})`}
                    </Typography>
                    <IconButton
                        onClick={handleMenuClick}
                        size="small"
                        sx={{ ml: 1 }}
                    >
                        <MoreHorizIcon />
                    </IconButton>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem onClick={handleImportClick} disabled={!selectedFolderId}>
                        <GetAppIcon sx={{ mr: 1 }} />
                        {t('import.import')}
                    </MenuItem>
                </Menu>

                <Box display="flex" sx={{mt: 2}} justifyContent="space-between" alignItems="center">
                    <Box>
                        <Button
                            onClick={() => setIsCreatingCard(true)}
                            sx={{mr: 2}}
                            variant="outlined"
                            disabled={!selectedFolderId}
                            startIcon={<NoteAddIcon />}
                        >
                            {t('cards.create')}
                        </Button>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Button
                            variant={showOnlyUnlearned ? "contained" : "outlined"}
                            size="small"
                            onClick={handleUnlearnedToggle}
                            sx={{ ml: 1 }}
                        >
                            {t('learning.learned')}
                        </Button>
                    </Box>
                </Box>

                {isLoading ? (
                    <Box mt={4} display="flex" justifyContent="center">
                        <CircularProgress/>
                    </Box>
                ) : (
                    <CardList 
                        cards={cards} 
                        displayFilter={displayFilter}
                        showOnlyUnlearned={showOnlyUnlearned}
                        onFilterChange={handleFilterChange}
                        selectAll={selectAll}
                        onSelectAllChange={handleSelectAllChange}
                    />
                )}
            </Paper>

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


        </>
    )
}