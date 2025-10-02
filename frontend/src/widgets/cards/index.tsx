import {Box, Button, CircularProgress, Paper, Typography} from "@mui/material";
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


export const Cards = () => {

    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [isImportingCards, setIsImportingCards] = useState(false);
    const { importCards } = useImportCards();

    const {
        cards,
        selectedFolderId,
        isLoading,
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

                <Box display="flex" justifyContent="flex-start" alignItems="center">
                    <Typography variant="h6">
                        Карточки {cards.length > 0 && `(${cards.length})`}
                    </Typography>
                </Box>

                <Box display="flex" sx={{mt: 2}} justifyContent="flex-start" alignItems="center">
                    <Box>
                        <Button
                            onClick={() => setIsCreatingCard(true)}
                            sx={{mr: 2}}
                            variant="outlined"
                            disabled={!selectedFolderId}
                            startIcon={<NoteAddIcon />}
                        >
                            Добавить карточку
                        </Button>
                        <Button
                            onClick={() => setIsImportingCards(true)}
                            sx={{mr: 2}}
                            variant="outlined"
                            color="secondary"
                            disabled={!selectedFolderId}
                            startIcon={<GetAppIcon />}
                        >
                            Импортировать
                        </Button>
                    </Box>
                </Box>

                {isLoading ? (
                    <Box mt={4} display="flex" justifyContent="center">
                        <CircularProgress/>
                    </Box>
                ) : (
                    <CardList cards={cards}/>
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