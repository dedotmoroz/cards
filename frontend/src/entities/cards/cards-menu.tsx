import { MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useTranslation } from 'react-i18next';
import {useState, useRef} from "react";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {ImportCardsButton, ImportGoogleSheetsDialog} from "@/features/import-cards";
import { MenuUI } from '@/shared/ui/menu-ui';
import { StyledIconButton } from './styled-components.ts';
import { cardsApi } from '@/shared/api/cardsApi';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '@/shared/config/api';
import {useNavigate, useParams} from "react-router-dom";
import {useAuthStore} from "@/shared/store/authStore.ts";
import {useCardsStore} from "@/shared/store/cardsStore.ts";
import {
    CloudArrowLeftIcon,
    // CloudArrowRightIcon,
    CloudInIcon,
    CloudOutIcon,
    FileReplaceOutlineIcon,
    AiContentIcon,
} from '@/shared/icons'

const googlePickerConfigured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY);

export const CardsMenu = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId, folderId: folderIdFromUrl } = useParams<{ userId?: string; folderId?: string }>();
    const { user } = useAuthStore();
    const currentUserId = user?.id;

    const { selectedFolderId, fetchFolders } = useFoldersStore();
    const { fetchCards } = useCardsStore();

    const [isImportingCards, setIsImportingCards] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    // const [isExportingSheets, setIsExportingSheets] = useState(false);
    const [importSheetsDialogOpen, setImportSheetsDialogOpen] = useState(false);
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
            await fetchCards(selectedFolderId);
        } catch (error) {
            console.error('Excel import error:', error);
        } finally {
            setIsImportingExcel(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImportSheetsClick = () => {
        setImportSheetsDialogOpen(true);
        handleMenuClose();
    };

    // const handleExportSheetsClick = async () => {
    //     if (!selectedFolderId) return;
    //     handleMenuClose();
    //     setIsExportingSheets(true);
    //     try {
    //         const result = await cardsApi.exportToGoogleSheets(selectedFolderId);
    //         window.open(result.spreadsheetUrl, '_blank');
    //     } catch (error) {
    //         console.error('Google Sheets export error:', error);
    //     } finally {
    //         setIsExportingSheets(false);
    //     }
    // };

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
                    <FileReplaceOutlineIcon style={{marginRight: '10px'}}/>
                    {t('import.import')}
                </MenuItem>
                <MenuItem onClick={handleImportExcelClick} disabled={!selectedFolderId || isImportingExcel}>
                    <CloudInIcon style={{marginRight: '10px'}} />
                    {isImportingExcel ? t('import.importing') : t('import.excelImport')}
                </MenuItem>
                <MenuItem onClick={handleExportClick} disabled={!selectedFolderId || isExporting}>
                    <CloudOutIcon style={{marginRight: '10px'}} />
                    {isExporting ? t('export.exporting') : t('export.export')}
                </MenuItem>

                {googlePickerConfigured && (
                    <MenuItem onClick={handleImportSheetsClick} disabled={!selectedFolderId}>
                        <CloudArrowLeftIcon style={{marginRight: '10px'}} />
                        {t('googleSheets.importFromSheets')}
                    </MenuItem>
                )}
                <MenuItem onClick={handleGoToContent} disabled={!selectedFolderId}>
                    <AiContentIcon style={{marginRight: '12px', marginLeft: '3px'}} />
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
            {selectedFolderId && (
                <ImportGoogleSheetsDialog
                    open={importSheetsDialogOpen}
                    folderId={selectedFolderId}
                    onClose={() => setImportSheetsDialogOpen(false)}
                    onSuccess={() => {
                        void fetchCards(selectedFolderId);
                        void fetchFolders();
                    }}
                />
            )}
        </>
    )
}
