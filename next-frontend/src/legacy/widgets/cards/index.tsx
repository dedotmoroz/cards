import { Alert, Box, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import {CardList} from "@/widgets/cards/card-list.tsx";
import {useState, useEffect} from "react";
import {useCardsStore} from "@/shared/store/cardsStore.ts";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import { CreateCardButton } from "@/features/create-card/index.tsx";
import { CreateAiContentButton } from "@/features/create-ai-content";
import {CardsMenu} from "@/entities/cards";
import { StyledWrapperBox, StyledTopBox, StyleLeftBox, StyledHeaderBox, StyledCreateCardBox, StyledCreateBlockMobile } from './styled-components.ts'

type CardsProps = {
    isLoading?: boolean;
    highlightCardId?: string | null;
    onHighlightComplete?: () => void;
};

export const Cards = ({
    isLoading = false,
    highlightCardId = null,
    onHighlightComplete,
}: CardsProps) => {
    const { t } = useTranslation();
    const [displayFilter, setDisplayFilter] = useState<'A' | 'AB' | 'B'>('AB');
    const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [googleSheetsNotice, setGoogleSheetsNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const {
        cards,
        updateFolderLearnStatus,
    } = useCardsStore();
    
    const {
        folders,
        selectedFolderId,
    } = useFoldersStore();

    const isRegularFolder = Boolean(
        selectedFolderId && !selectedFolderId.startsWith('virtual:')
    );
    
    const selectedFolder = folders.find(f => f.id === selectedFolderId);

    // Сбрасываем форму создания при смене папки
    useEffect(() => {
        setIsCreatingCard(false);
        setSelectAll(false);
    }, [selectedFolderId]);

    useEffect(() => {
        setSelectAll(cards.length > 0 && cards.every((card) => card.isLearned));
    }, [cards]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const connected = params.get('google_sheets');
        const errorCode = params.get('google_sheets_error');
        if (!connected && !errorCode) {
            return;
        }
        if (connected === 'connected') {
            setGoogleSheetsNotice({
                type: 'success',
                text: t('googleSheets.connectSuccessMessage'),
            });
        } else if (errorCode) {
            setGoogleSheetsNotice({
                type: 'error',
                text: `${t('googleSheets.connectError')}${errorCode ? ` (${errorCode})` : ''}`,
            });
        }
        params.delete('google_sheets');
        params.delete('google_sheets_error');
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', nextUrl);
    }, [t]);

    const handleFilterChange = (newFilter: 'A' | 'AB' | 'B') => {
        console.log('handleFilterChange called with:', newFilter);
        setDisplayFilter(newFilter);
    };

    const handleUnlearnedToggle = () => {
        setShowOnlyUnlearned(!showOnlyUnlearned);
    };

    const handleSelectAllChange = async (isChecked: boolean) => {
        if (!selectedFolderId || !isRegularFolder || isBulkUpdating) return;

        setIsBulkUpdating(true);
        setSelectAll(isChecked);

        try {
            await updateFolderLearnStatus(selectedFolderId, isChecked);
        } catch {
            setSelectAll(cards.length > 0 && cards.every((card) => card.isLearned));
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleToggleCreateCard = () => {
        setIsCreatingCard(prev => !prev);
    };

    return (
        <StyledWrapperBox>
            {googleSheetsNotice ? (
                <Alert
                    severity={googleSheetsNotice.type}
                    onClose={() => setGoogleSheetsNotice(null)}
                    sx={{ mb: 2 }}
                >
                    {googleSheetsNotice.text}
                </Alert>
            ) : null}
            <StyledTopBox>
                <StyleLeftBox>
                    <Box>
                        <StyledHeaderBox>
                            <Typography variant="h5" fontWeight="bold">
                                {selectedFolder 
                                    ? selectedFolder.name.charAt(0).toUpperCase() + selectedFolder.name.slice(1)
                                    : t('cards.title')}
                            </Typography>
                            <CardsMenu
                                onGoogleSheetsDisconnected={() =>
                                    setGoogleSheetsNotice({
                                        type: 'success',
                                        text: t('googleSheets.disconnectedSuccess'),
                                    })
                                }
                            />
                        </StyledHeaderBox>
                        {cards.length > 0
                            ? (<Typography variant="body1" color="text.secondary">
                                    {cards.length} {t('cards.title').toLowerCase()}
                                </Typography>)
                            :
                            (<Typography variant="body1" color="text.secondary">
                                  &nbsp;
                            </Typography>)
                        }
                    </Box>
                </StyleLeftBox>
                <StyledCreateCardBox >
                        <CreateAiContentButton />
                        <CreateCardButton onToggleForm={handleToggleCreateCard} isFormOpen={isCreatingCard}/>
                </StyledCreateCardBox>
            </StyledTopBox>

            <StyledCreateBlockMobile>
                            <CreateAiContentButton />
                            <CreateCardButton onToggleForm={handleToggleCreateCard} isFormOpen={isCreatingCard}/>
            </StyledCreateBlockMobile>
                        
            <CardList
                cards={cards}
                displayFilter={displayFilter}
                showOnlyUnlearned={showOnlyUnlearned}
                onFilterChange={handleFilterChange}
                selectAll={selectAll}
                onSelectAllChange={isRegularFolder ? handleSelectAllChange : undefined}
                onToggleShowOnlyUnlearned={handleUnlearnedToggle}
                isCreatingCard={isCreatingCard}
                folderId={selectedFolderId ?? undefined}
                onCancelCreateCard={() => setIsCreatingCard(false)}
                isLoading={isLoading}
                highlightCardId={highlightCardId}
                onHighlightComplete={onHighlightComplete}
            />
        </StyledWrapperBox>
    )
}