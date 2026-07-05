import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {ListItemText} from '@mui/material';
import MoreVerticalIcon from '@mui/icons-material/MoreHoriz';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import { MenuUI } from '@/shared/ui/menu-ui';
import { RenameFolderMenuItem } from '@/features/rename-folder';
import { DeleteFolderMenuItem } from '@/features/delete-folder';
import { PinFolderMenuItem } from '@/features/pin-folder';
import { useAuthStore } from '@/shared/store/authStore';

import { StyledListItemButton, StyledIconButton, StyledMenuBox, StyledList, StyledFolderCounter, StyledPinIcon, VIRTUAL_FOLDER_COLOR } from "./styled-components.ts"

export interface Folder {
    id: string;
    name: string;
    sideALanguage?: string;
    sideBLanguage?: string;
    pinned?: boolean;
}

interface FolderListProps {
    folders: Folder[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRename?: (id: string, name: string, sideALanguage: string, sideBLanguage: string) => void;
    onDelete?: (id: string) => void;
    onPinToggle?: (id: string, pinned: boolean) => void;
    onFolderSelect?: () => void;
    folderCardCounts?: Record<string, number>;
    /** Реальное число карточек в «Сложно» (из API). */
    hardVirtualCount?: number | null;
}

export const FolderList = ({
    folders,
    selectedId,
    onSelect,
    onRename,
    onDelete,
    onPinToggle,
    onFolderSelect,
    folderCardCounts,
    hardVirtualCount,
}: FolderListProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const { user } = useAuthStore();
    const currentUserId = userId || user?.id;

    const isVirtualFolderId = (id: string) => id.startsWith('virtual:');
    const virtualKind = (id: string) => id.replace(/^virtual:/, '');

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, folderId: string) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedFolderId(folderId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFolderId(null);
    };

    const handleFolderClick = (folderId: string) => {
        onSelect(folderId);
        if (isVirtualFolderId(folderId)) {
            const kind = virtualKind(folderId);
            if (currentUserId) {
                navigate(`/learn/${currentUserId}/virtual/${kind}`);
            } else {
                navigate(`/learn/virtual/${kind}`);
            }
            if (onFolderSelect) {
                onFolderSelect();
            }
            return;
        }
        if (currentUserId) {
            navigate(`/learn/${currentUserId}/${folderId}`);
        } else {
            navigate(`/learn/${folderId}`);
        }
        if (onFolderSelect) {
            onFolderSelect();
        }
    };

    return (
        <>
            <StyledList>
                {folders.map((folder) => {
                    const isVirtual = isVirtualFolderId(folder.id);
                    const folderIconSx = isVirtual
                        ? { mr: 1, color: VIRTUAL_FOLDER_COLOR }
                        : { mr: 1 };
                    return (
                    <StyledListItemButton
                        disableRipple
                        key={folder.id}
                        selected={selectedId === folder.id}
                        onClick={() => handleFolderClick(folder.id)}
                    >
                        <StyledMenuBox>
                            {selectedId === folder.id
                                ? <FolderOpenOutlinedIcon sx={folderIconSx}/>
                                : <FolderOutlinedIcon sx={folderIconSx}/>}
                            {folderCardCounts && (
                                <StyledFolderCounter>
                                    {isVirtual
                                        ? folder.id === 'virtual:hard'
                                            ? (hardVirtualCount ?? 0)
                                            : 10
                                        : (folderCardCounts[folder.id] ?? 0)}
                                </StyledFolderCounter>
                            )}
                            {!isVirtual && folder.pinned ? (
                                <StyledPinIcon aria-hidden>
                                    <PushPinIcon />
                                </StyledPinIcon>
                            ) : null}
                            <ListItemText primary={folder.name} />
                            {!isVirtual ? (
                                <StyledIconButton
                                    edge="end"
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, folder.id)}
                                >
                                    <MoreVerticalIcon />
                                </StyledIconButton>
                            ) : null}
                        </StyledMenuBox>
                    </StyledListItemButton>
                    );
                })}
            </StyledList>

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
                    const folder = folders.find((f) => f.id === selectedFolderId);
                    if (!folder) return null;
                    if (isVirtualFolderId(folder.id)) return null;
                    return [
                        onPinToggle ? (
                            <PinFolderMenuItem
                                key="pin"
                                folderId={folder.id}
                                pinned={Boolean(folder.pinned)}
                                onPinToggle={onPinToggle}
                                onMenuClose={handleMenuClose}
                            />
                        ) : null,
                        onRename ? (
                            <RenameFolderMenuItem
                                key="rename"
                                folderId={folder.id}
                                folderName={folder.name}
                                sideALanguage={folder.sideALanguage ?? 'en'}
                                sideBLanguage={folder.sideBLanguage ?? 'ru'}
                                onRename={onRename}
                                onMenuClose={handleMenuClose}
                            />
                        ) : null,
                        onDelete ? (
                            <DeleteFolderMenuItem
                                key="delete"
                                folderId={folder.id}
                                folderName={folder.name}
                                onDelete={onDelete}
                                onMenuClose={handleMenuClose}
                            />
                        ) : null,
                    ];
                })()}
            </MenuUI>
        </>
    );
};
