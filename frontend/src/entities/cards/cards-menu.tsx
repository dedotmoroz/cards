import {MenuItem} from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DriveFolderUpload from '@mui/icons-material/DriveFolderUpload';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useTranslation } from 'react-i18next';
import {useState} from "react";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {ImportCardsButton} from "@/features/import-cards";
import { MenuUI } from '@/shared/ui/menu-ui';
import { StyledIconButton } from './styled-components.ts';
import { cardsApi } from '@/shared/api/cardsApi';
import {useNavigate, useParams} from "react-router-dom";
import {useAuthStore} from "@/shared/store/authStore.ts";

export const CardsMenu = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId, folderId: folderIdFromUrl } = useParams<{ userId?: string; folderId?: string }>();
    const { user } = useAuthStore();
    const currentUserId = user?.id;

    const { selectedFolderId } = useFoldersStore();

    const [isImportingCards, setIsImportingCards] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
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

    const handleGoToContent = () => {
        const currentFolderId = folderIdFromUrl || selectedFolderId;
        const currentUserIdForNav = userId || currentUserId;
        navigate(`/learn/${currentUserIdForNav}/${currentFolderId}/context-reading`)
        handleMenuClose();
    };

    const handleExportClick = async () => {
        if (!selectedFolderId) return;
        
        setIsExporting(true);
        handleMenuClose();
        
        try {
            await cardsApi.exportCardsToExcel(selectedFolderId);
        } catch (error) {
            console.error('Export error:', error);
            // Можно добавить уведомление об ошибке
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <StyledIconButton
                onClick={handleMenuClick}
                size="small"
                sx={{ml: 1}}
            >
                <MoreHorizIcon/>
            </StyledIconButton>

            {/* Dots menu */}
            <MenuUI
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
                    <DriveFolderUpload sx={{mr: 1}}/>
                    {t('import.import')}
                </MenuItem>
                <MenuItem onClick={handleExportClick} disabled={!selectedFolderId || isExporting}>
                    <FileDownloadIcon sx={{mr: 1}}/>
                    {isExporting ? t('export.exporting') : t('export.export')}
                </MenuItem>
                <MenuItem onClick={handleGoToContent} disabled={!selectedFolderId}>
                    <AutoStoriesOutlinedIcon sx={{mr: 1}}/>
                    {t('cards.context')}
                </MenuItem>
            </MenuUI>
            <ImportCardsButton isImportingCards={isImportingCards} setIsImportingCards={setIsImportingCards}/>
        </>
    )
}