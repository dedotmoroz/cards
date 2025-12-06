import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useMediaQuery, useTheme} from "@mui/material";
import {CreateCardDialog} from "@/features/create-card.tsx";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {useCreateCard} from "@/features/create-card/useCreateCard.ts";
import {StyledButton, StyledPlusIcon} from "./styled-components";

export const CreateCardButton = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
            <StyledButton
                onClick={() => setIsCreatingCard(true)}
                disabled={!selectedFolderId}
                startIcon={<StyledPlusIcon/>}
            >
                <span style={{ display: isMobile ? 'none' : 'inline' }}>
                    {t('cards.create')}
                </span>
            </StyledButton>
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
