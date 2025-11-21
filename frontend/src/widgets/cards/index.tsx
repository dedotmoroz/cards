import {Box, Typography} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {CardList} from "@/widgets/cards/card-list.tsx";
import {useState} from "react";
import {useCardsStore} from "@/shared/store/cardsStore.ts";
import { CreateCardButton } from "@/features/create-card/index.tsx";
import {CardsMenu} from "@/entities/cards";

import styled from './style.module.css'

export const Cards = () => {
    const { t } = useTranslation();
    const [displayFilter, setDisplayFilter] = useState<'A' | 'AB' | 'B'>('AB');
    const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    const {
        cards,
        updateCardLearnStatus,
    } = useCardsStore();

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
        <Box className={styled.cardsWrapper}>
            <Box className={styled.cardsInfoBlock}>
                <Box display="flex" alignItems="center">
                    {/* Title */}
                    <Typography variant="h6">
                        {t('cards.title')} {cards.length > 0 && `(${cards.length})`}
                    </Typography>
                    {/* Menu */}
                    <CardsMenu/>
                </Box>
                <Box ml={4}>
                    {/* Add card */}
                    <CreateCardButton/>
                </Box>
            </Box>
            <CardList
                cards={cards}
                displayFilter={displayFilter}
                showOnlyUnlearned={showOnlyUnlearned}
                onFilterChange={handleFilterChange}
                selectAll={selectAll}
                onSelectAllChange={handleSelectAllChange}
                onToggleShowOnlyUnlearned={handleUnlearnedToggle}
            />
        </Box>
    )
}