import {Button} from "@mui/material";
import {useState} from "react";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import {useTranslation} from "react-i18next";
import {CreateCardDialog} from "@/features/create-card.tsx";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {useCreateCard} from "@/features/create-card/useCreateCard.ts";

export const CreateCardButton = () => {
    const { t } = useTranslation();
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const { selectedFolderId } = useFoldersStore();
    const { createCard } = useCreateCard();

    const handleCreateCard = async (card: { question: string; answer: string; folderId: string }) => {
        if (selectedFolderId) {
            await createCard(selectedFolderId, card.question, card.answer);
            setIsCreatingCard(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsCreatingCard(true)}
                sx={{mr: 2, borderRadius: 8}}
                variant="outlined"
                disabled={!selectedFolderId}
                startIcon={<NoteAddIcon/>}
            >
                {t('cards.create')}
            </Button>

            {selectedFolderId && (
                <CreateCardDialog
                    open={isCreatingCard}
                    folderId={selectedFolderId}
                    onClose={() => setIsCreatingCard(false)}
                    onCreate={handleCreateCard}
                />
            )}
        </>
    )
}
