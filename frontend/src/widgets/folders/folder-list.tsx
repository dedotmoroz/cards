import {
    List,
    ListItemButton,
    ListItemText,
    IconButton,
    Box,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    ListItemIcon
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import React, { useState } from 'react';
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";

export interface Folder {
    id: string;
    name: string;
}

interface FolderListProps {
    folders: Folder[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRename?: (id: string, name: string) => void;
    onDelete?: (id: string) => void;
}

export const FolderList = ({ folders, selectedId, onSelect, onRename, onDelete }: FolderListProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [renameOpen, setRenameOpen] = useState(false);
    const [renameName, setRenameName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, folderId: string) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedFolderId(folderId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFolderId(null);
    };

    const handleRename = () => {
        if (selectedFolderId) {
            const folder = folders.find(f => f.id === selectedFolderId);
            if (folder) {
                setEditingFolderId(selectedFolderId);
                setRenameName(folder.name);
                setRenameOpen(true);
            }
        }
        handleMenuClose();
    };

    const handleRenameCancel = () => {
        setRenameOpen(false);
        setEditingFolderId(null);
    };

    const handleRenameSave = () => {
        if (!editingFolderId || !onRename) return;
        const name = renameName.trim();
        if (!name) {
            setRenameOpen(false);
            setEditingFolderId(null);
            return;
        }
        onRename(editingFolderId, name);
        setRenameOpen(false);
        setEditingFolderId(null);
    };

    const handleDelete = () => {
        if (selectedFolderId && onDelete) {
            const folder = folders.find(f => f.id === selectedFolderId);
            if (folder && confirm(`Вы уверены, что хотите удалить папку "${folder.name}"?`)) {
                onDelete(selectedFolderId);
            }
        }
        handleMenuClose();
    };

    return (
        <>
            <List>
                {folders.map((folder) => (
                    <ListItemButton
                        key={folder.id}
                        selected={selectedId === folder.id}
                        onClick={() => onSelect(folder.id)}
                    >
                        <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
                            {selectedId === folder.id ? <FolderOpenOutlinedIcon sx={{mr: 1}}/> : <FolderOutlinedIcon sx={{mr: 1}}/>}
                            <ListItemText primary={folder.name} />
                            <IconButton
                                edge="end"
                                size="small"
                                onClick={(e) => handleMenuOpen(e, folder.id)}
                            >
                                <MoreHorizIcon />
                            </IconButton>
                        </Box>
                    </ListItemButton>
                ))}
            </List>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleRename}>
                    <ListItemIcon>
                        <DriveFileRenameOutlineIcon/>
                    </ListItemIcon>
                    <ListItemText>
                        Переименовать
                    </ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                        <DeleteIcon/>
                    </ListItemIcon>
                    <ListItemText>
                        Удалить
                    </ListItemText>
                </MenuItem>
            </Menu>

            <Dialog open={renameOpen} onClose={handleRenameCancel} fullWidth>
                <DialogTitle>Переименовать папку</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название папки"
                        fullWidth
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRenameCancel}>Отмена</Button>
                    <Button onClick={handleRenameSave} variant="contained">Сохранить</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};