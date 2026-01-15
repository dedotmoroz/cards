import {MenuItem} from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DriveFolderUpload from '@mui/icons-material/DriveFolderUpload';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useTranslation } from 'react-i18next';
import {useState, useRef} from "react";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {ImportCardsButton} from "@/features/import-cards";
import { MenuUI } from '@/shared/ui/menu-ui';
import { StyledIconButton } from './styled-components.ts';
import { cardsApi } from '@/shared/api/cardsApi';
import {useNavigate, useParams} from "react-router-dom";
import {useAuthStore} from "@/shared/store/authStore.ts";
import {useCardsStore} from "@/shared/store/cardsStore.ts";

export const CardsMenu = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId, folderId: folderIdFromUrl } = useParams<{ userId?: string; folderId?: string }>();
    const { user } = useAuthStore();
    const currentUserId = user?.id;

    const { selectedFolderId } = useFoldersStore();
    const { fetchCards } = useCardsStore();

    const [isImportingCards, setIsImportingCards] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImportExcelClick = () => {
        fileInputRef.current?.click();
        handleMenuClose();
    };

    const handleExcelFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedFolderId) return;
        
        setIsImportingExcel(true);
        try {
            const result = await cardsApi.importCardsFromExcel(selectedFolderId, file);
            console.log('Import result:', result);
            // Обновляем список карточек после импорта
            await fetchCards(selectedFolderId);
        } catch (error) {
            console.error('Excel import error:', error);
            // Можно добавить уведомление об ошибке
        } finally {
            setIsImportingExcel(false);
            // Сбрасываем input для возможности повторного выбора того же файла
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                <MenuItem onClick={handleImportExcelClick} disabled={!selectedFolderId || isImportingExcel}>
                    <TableChartIcon sx={{mr: 1}}/>
                    {isImportingExcel ? t('import.importing') : t('import.excelImport')}
                </MenuItem>
                <MenuItem onClick={handleGoToContent} disabled={!selectedFolderId}>
                    <AutoStoriesOutlinedIcon sx={{mr: 1}}/>
                    {t('cards.context')}
                </MenuItem>
            </MenuUI>
            
            {/* Скрытый input для выбора файла */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleExcelFileChange}
            />
            
            <ImportCardsButton isImportingCards={isImportingCards} setIsImportingCards={setIsImportingCards}/>
        </>
    )
}