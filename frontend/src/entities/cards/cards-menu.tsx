import {IconButton, Menu, MenuItem} from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useTranslation } from 'react-i18next';
import {useState} from "react";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {ImportCardsButton} from "@/features/import-cards";

export const CardsMenu = () => {
    const { t } = useTranslation();
    const { selectedFolderId } = useFoldersStore();

    const [isImportingCards, setIsImportingCards] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

    return (
        <>
            <IconButton
                onClick={handleMenuClick}
                size="small"
                sx={{ml: 1}}
            >
                <MoreHorizIcon/>
            </IconButton>

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
            <ImportCardsButton isImportingCards={isImportingCards} setIsImportingCards={setIsImportingCards}/>
        </>
    )
}