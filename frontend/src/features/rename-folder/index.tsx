import { useState, useEffect } from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useTranslation } from 'react-i18next';
import { RenameFolderDialog } from './rename-folder-dialog';
import { createPortal } from 'react-dom';

interface RenameFolderMenuItemProps {
    folderId: string;
    folderName: string;
    sideALanguage: string;
    sideBLanguage: string;
    onRename: (id: string, name: string, sideALanguage: string, sideBLanguage: string) => void;
    onMenuClose: () => void;
}

const dialogStateStore = new Map<string, { open: boolean; folderName: string }>();

export const RenameFolderMenuItem = ({
    folderId,
    folderName,
    sideALanguage,
    sideBLanguage,
    onRename,
    onMenuClose,
}: RenameFolderMenuItemProps) => {
    const { t } = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const storedState = dialogStateStore.get(folderId);
        if (storedState?.open) {
            setDialogOpen(true);
        }
    }, [folderId]);

    const handleClick = () => {
        dialogStateStore.set(folderId, { open: true, folderName });
        setDialogOpen(true);
    };

    const handleSave = (name: string, sideA: string, sideB: string) => {
        onRename(folderId, name, sideA, sideB);
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
                <ListItemText>{t('buttons.edit')}</ListItemText>
            </MenuItem>
            {dialogOpen &&
                createPortal(
                    <RenameFolderDialog
                        open={dialogOpen}
                        folderName={folderName}
                        sideALanguage={sideALanguage}
                        sideBLanguage={sideBLanguage}
                        onClose={handleClose}
                        onSave={handleSave}
                    />,
                    document.body,
                )}
        </>
    );
};
