import React, { useState } from 'react';
import {List, ListItemText,} from '@mui/material';
import MoreVerticalIcon from '@mui/icons-material/MoreHoriz';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { MenuUI } from '@/shared/ui/menu-ui';
import { RenameFolderMenuItem } from '@/features/rename-folder';
import { DeleteFolderMenuItem } from '@/features/delete-folder';

import { StyledListItemButton, StyledIconButton, StyledMenuBox } from "./styled-components.ts"

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

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, folderId: string) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedFolderId(folderId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFolderId(null);
    };

    return (
        <>
            <List>
                {folders.map((folder) => (
                    <StyledListItemButton
                        disableRipple
                        key={folder.id}
                        selected={selectedId === folder.id}
                        onClick={() => onSelect(folder.id)}
                    >
                        <StyledMenuBox>
                            {selectedId === folder.id
                                ? <FolderOpenOutlinedIcon sx={{mr: 1}}/>
                                : <FolderOutlinedIcon sx={{mr: 1}}/>}
                            <ListItemText primary={folder.name} />
                            <StyledIconButton
                                edge="end"
                                size="small"
                                onClick={(e) => handleMenuOpen(e, folder.id)}
                            >
                                <MoreVerticalIcon />
                            </StyledIconButton>
                        </StyledMenuBox>
                    </StyledListItemButton>
                ))}
            </List>

            <MenuUI
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
                {selectedFolderId && (() => {
                    const folder = folders.find(f => f.id === selectedFolderId);
                    if (!folder) return null;
                    return (
                        <>
                            {onRename && (
                                <RenameFolderMenuItem
                                    folderId={folder.id}
                                    folderName={folder.name}
                                    onRename={onRename}
                                    onMenuClose={handleMenuClose}
                                />
                            )}
                            {onDelete && (
                                <DeleteFolderMenuItem
                                    folderId={folder.id}
                                    folderName={folder.name}
                                    onDelete={onDelete}
                                    onMenuClose={handleMenuClose}
                                />
                            )}
                        </>
                    );
                })()}
            </MenuUI>
        </>
    );
};