import { useState, useEffect } from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useTranslation } from 'react-i18next';
import { RenameFolderDialog } from './rename-folder-dialog';
import {createPortal} from "react-dom";

interface RenameFolderMenuItemProps {
    folderId: string;
    folderName: string;
    onRename: (id: string, name: string) => void;
    onMenuClose: () => void;
}

// Глобальное хранилище для состояния диалогов (чтобы не терялось при размонтировании)
const dialogStateStore = new Map<string, { open: boolean; folderName: string }>();

export const RenameFolderMenuItem = ({ folderId, folderName, onRename, onMenuClose }: RenameFolderMenuItemProps) => {
    const { t } = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        // Восстанавливаем состояние из хранилища при монтировании
        const storedState = dialogStateStore.get(folderId);
        if (storedState?.open) {
            setDialogOpen(true);
        }
    }, [folderId]);

    const handleClick = () => {
        dialogStateStore.set(folderId, { open: true, folderName });
        setDialogOpen(true);
    };

    const handleSave = (name: string) => {
        onRename(folderId, name);
        dialogStateStore.delete(folderId);
        setDialogOpen(false);
    };

    const handleClose = () => {
        dialogStateStore.delete(folderId);
        setDialogOpen(false);
        onMenuClose();
    };

    return (
        <>
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <DriveFileRenameOutlineIcon />
                </ListItemIcon>
                <ListItemText>
                    {t('buttons.edit')}
                </ListItemText>
            </MenuItem>
            {dialogOpen && (createPortal(
                <RenameFolderDialog
                    open={dialogOpen}
                    folderName={folderName}
                    onClose={handleClose}
                    onSave={handleSave}
                />, document.body)
            )}
        </>
    );
};

