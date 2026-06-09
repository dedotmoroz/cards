import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

interface DeleteFolderMenuItemProps {
    folderId: string;
    folderName: string;
    onDelete: (id: string) => void;
    onMenuClose: () => void;
}

export const DeleteFolderMenuItem = ({ folderId, folderName, onDelete, onMenuClose }: DeleteFolderMenuItemProps) => {
    const { t } = useTranslation();

    const handleClick = () => {
        if (confirm(`${t('folders.delete')} "${folderName}"?`)) {
            onDelete(folderId);
        }
        onMenuClose();
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <DeleteIcon />
            </ListItemIcon>
            <ListItemText>
                {t('buttons.delete')}
            </ListItemText>
        </MenuItem>
    );
};

