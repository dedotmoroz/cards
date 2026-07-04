import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useTranslation } from 'react-i18next';

interface PinFolderMenuItemProps {
    folderId: string;
    pinned: boolean;
    onPinToggle: (id: string, pinned: boolean) => void;
    onMenuClose: () => void;
}

export const PinFolderMenuItem = ({
    folderId,
    pinned,
    onPinToggle,
    onMenuClose,
}: PinFolderMenuItemProps) => {
    const { t } = useTranslation();

    const handleClick = () => {
        onPinToggle(folderId, !pinned);
        onMenuClose();
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
            </ListItemIcon>
            <ListItemText>
                {pinned ? t('folders.unpin') : t('folders.pin')}
            </ListItemText>
        </MenuItem>
    );
};
