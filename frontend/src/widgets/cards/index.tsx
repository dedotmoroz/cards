import {Box, Button, CircularProgress, Paper, Typography, IconButton, Menu, MenuItem, Select, FormControl, InputLabel} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {CardList} from "@/widgets/cards/card-list.tsx";
import {useState} from "react";
import {useCardsStore} from "@/shared/store/cardsStore.ts";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
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
    // Сохраняем выбор пользователя в localStorage
    const [initialSide, setInitialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });
    const { importCards } = useImportCards();

    // Сохраняем выбор в localStorage при изменении
    const handleInitialSideChange = (side: 'question' | 'answer') => {
        setInitialSide(side);
        localStorage.setItem('cardInitialSide', side);
    };

    const {
        cards,
        isLoading,
        updateCardLearnStatus,
    } = useCardsStore();
    const { selectedFolderId } = useFoldersStore();

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
            navigate(`/learn/${selectedFolderId}?initialSide=${initialSide}`);
        }
    };

    const handleStartLearningUnlearned = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?mode=unlearned&initialSide=${initialSide}`);
        }
    };

    const handleStartLearningPhrases = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?mode=phrases&initialSide=${initialSide}`);
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
                <Box display="flex" mb={4} gap={2} justifyContent="flex-end" alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>{t('learning.initialSide')}</InputLabel>
                            <Select
                                value={initialSide}
                                label={t('learning.initialSide')}
                                onChange={(e) => handleInitialSideChange(e.target.value as 'question' | 'answer')}
                                sx={{borderRadius: 2}}
                            >
                                <MenuItem value="question">{t('learning.showQuestion')}</MenuItem>
                                <MenuItem value="answer">{t('learning.showAnswer')}</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            onClick={handleStartLearning}
                            variant="contained"
                            disabled={!selectedFolderId || cards.length === 0}
                            sx={{borderRadius: 8}}
                        >
                            {t('buttons.startLearning')}
                        </Button>
                        <Button
                            onClick={handleStartLearningPhrases}
                            variant="contained"
                            disabled={!selectedFolderId || cards.length === 0 || !cards.some(card => card.questionSentences && card.answerSentences)}
                            sx={{borderRadius: 8}}
                        >
                            {t('buttons.learnPhrases')}
                        </Button>
                        <Button
                            onClick={handleStartLearningUnlearned}
                            variant="contained"
                            color="secondary"
                            disabled={!selectedFolderId || cards.length === 0}
                            sx={{borderRadius: 8}}
                        >
                            {t('learning.wantToContinue')}
                        </Button>
                </Box>

                <Box display="flex" mb={2} justifyContent="flex-start" alignItems="center">
                    {/* Title */}
                    <Box display="flex" alignItems="center">
                        <Typography variant="h6">
                            {t('cards.title')} {cards.length > 0 && `(${cards.length})`}
                        </Typography>
                        <IconButton
                            onClick={handleMenuClick}
                            size="small"
                            sx={{ml: 1}}
                        >
                            <MoreHorizIcon/>
                        </IconButton>
                    </Box>

                    {/* Dots menu */}
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
                            <GetAppIcon sx={{mr: 1}}/>
                            {t('import.import')}
                        </MenuItem>
                    </Menu>

                    {/* Add card */}
                    <Box ml={4}>
                        <Button
                            onClick={() => setIsCreatingCard(true)}
                            sx={{mr: 2, borderRadius: 8}}
                            variant="outlined"
                            disabled={!selectedFolderId}
                            startIcon={<NoteAddIcon/>}
                        >
                            {t('cards.create')}
                        </Button>
                    </Box>
                </Box>

                {/* Filter moved into CardList header */}

                {isLoading ? (
                    <Box mt={4} display="flex" justifyContent="center" alignItems="center">
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
                        onToggleShowOnlyUnlearned={handleUnlearnedToggle}
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