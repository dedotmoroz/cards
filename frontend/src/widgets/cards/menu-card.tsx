import {ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import { useTranslation } from 'react-i18next';
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";

interface MenuCardProps {
    handleMenuClose: () => void;
    anchorEl: HTMLElement | null;
    handleRename: () => void;
    handleDelete: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
                             handleMenuClose,
                             anchorEl,
                             handleRename,
                             handleDelete,
                         }) => {
    const { t } = useTranslation();
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
        >
            <MenuItem onClick={handleRename}>
                <ListItemIcon>
                    <DriveFileRenameOutlineIcon/>
                </ListItemIcon>
                <ListItemText>
                    {t('buttons.edit')}
                </ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
                <ListItemIcon>
                    <DeleteIcon/>
                </ListItemIcon>
                <ListItemText>
                    {t('buttons.delete')}
                </ListItemText>
            </MenuItem>
        </Menu>
    )
}