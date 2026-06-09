import {ImportCardsDialog} from "@/features/import-cards/import-cards-dialog.tsx";
import {ImportGoogleSheetsDialog} from "@/features/import-cards/import-google-sheets-dialog.tsx";

export { ImportGoogleSheetsDialog };
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {useImportCards} from "@/features/import-cards/useImportCards.ts";

interface ImportCardsButtonProps {
    isImportingCards: boolean;
    setIsImportingCards: (value: boolean) => void;
}

export const ImportCardsButton = ({
                                      isImportingCards,
                                      setIsImportingCards
                                  }: ImportCardsButtonProps) => {
    const {selectedFolderId} = useFoldersStore();
    const {importCards} = useImportCards();

    const handleImportCards = async (cards: { question: string; answer: string }[]) => {
        if (selectedFolderId) {
            await importCards(selectedFolderId, cards);
            setIsImportingCards(false);
        }
    };

    return (
        selectedFolderId && (
            <ImportCardsDialog
                open={isImportingCards}
                folderId={selectedFolderId}
                onClose={() => setIsImportingCards(false)}
                onImport={handleImportCards}
            />
        )
    )
}