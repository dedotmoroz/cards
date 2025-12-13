import {Box, Typography} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {CardList} from "@/widgets/cards/card-list.tsx";
import {useState} from "react";
import {useCardsStore} from "@/shared/store/cardsStore.ts";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import { CreateCardButton } from "@/features/create-card/index.tsx";
import {CardsMenu} from "@/entities/cards";
import { StyledWrapperBox, StyledTopBox, StyleLeftBox, StyledHeaderBox } from './styled-components.ts'

export const Cards = () => {
    const { t } = useTranslation();
    const [displayFilter, setDisplayFilter] = useState<'A' | 'AB' | 'B'>('AB');
    const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    const {
        cards,
        updateCardLearnStatus,
    } = useCardsStore();
    
    const {
        folders,
        selectedFolderId,
    } = useFoldersStore();
    
    const selectedFolder = folders.find(f => f.id === selectedFolderId);

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

    return (
        <StyledWrapperBox>
            <StyledTopBox>
                <StyleLeftBox>
                    <Box>
                        <StyledHeaderBox>
                            <Typography variant="h5" fontWeight="bold">
                                {selectedFolder 
                                    ? selectedFolder.name.charAt(0).toUpperCase() + selectedFolder.name.slice(1)
                                    : t('cards.title')}
                            </Typography>
                            <CardsMenu/>
                        </StyledHeaderBox>
                        {cards.length > 0 && (
                            <Typography variant="body1" color="text.secondary">
                                {cards.length} {t('cards.title').toLowerCase()}
                            </Typography>
                        )}
                    </Box>
                </StyleLeftBox>
                <Box>
                    {/* Add card */}
                    <CreateCardButton/>
                </Box>
            </StyledTopBox>
            <CardList
                cards={cards}
                displayFilter={displayFilter}
                showOnlyUnlearned={showOnlyUnlearned}
                onFilterChange={handleFilterChange}
                selectAll={selectAll}
                onSelectAllChange={handleSelectAllChange}
                onToggleShowOnlyUnlearned={handleUnlearnedToggle}
            />
        </StyledWrapperBox>
    )
}