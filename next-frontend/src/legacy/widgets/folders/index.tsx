import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import {FolderList} from "@/widgets/folders/folder-list.tsx";
import {CreateFolder} from "@/features/create-folder/index.tsx";
import { SearchCardsDialog } from '@/features/search-cards';
import { useFoldersStore, REMEMBER_VIRTUAL_MIN_TOTAL_CARDS } from '@/shared/store/foldersStore.ts';
import { useAuthStore } from '@/shared/store/authStore.ts';
import { sortFolders } from '@/shared/libs/sort-folders.ts';
import {StyledWrappedBox, StyledCaptionBox, StyledTypography, StyledFoldersCounter, StyledHeaderActions} from "./styled-components.ts";

interface FoldersProps {
    onFolderSelect?: () => void;
}

export const Folders = ({ onFolderSelect }: FoldersProps) => {
    const { t, i18n } = useTranslation();
    const folderSortMode = useAuthStore((state) => state.user?.folderSortMode ?? 'created_desc');
    const updateFolderSortMode = useAuthStore((state) => state.updateFolderSortMode);
    const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const {
        folders,
        folderCardCounts,
        rememberEligibleCount,
        hardEligibleCount,
        selectedFolderId,
        setSelectedFolder,
        updateFolder,
        deleteFolder
    } = useFoldersStore();

    const handleRename = (
        id: string,
        name: string,
        sideALanguage: string,
        sideBLanguage: string,
    ) => {
        void updateFolder(id, { name, sideALanguage, sideBLanguage });
    };

    const handlePinToggle = (id: string, pinned: boolean) => {
        void updateFolder(id, { pinned });
    };

    const handleSortModeChange = (mode: 'created_desc' | 'name_asc') => {
        setSortAnchorEl(null);
        void updateFolderSortMode(mode);
    };

    const totalCards = useMemo(
        () => Object.values(folderCardCounts ?? {}).reduce((sum, n) => sum + (n ?? 0), 0),
        [folderCardCounts]
    );

    const foldersForUi = useMemo(() => {
        const ordered = sortFolders(folders, folderSortMode, i18n.language);
        const showRemember =
            rememberEligibleCount === null ||
            rememberEligibleCount >= REMEMBER_VIRTUAL_MIN_TOTAL_CARDS;
        const showHard = hardEligibleCount === null || hardEligibleCount > 0;
        const virtuals = [
            ...(showRemember
                ? [{ id: 'virtual:remember', name: t('folders.virtual.remember', 'Вспомни') }]
                : []),
            ...(showHard ? [{ id: 'virtual:hard', name: t('folders.virtual.hard', 'Сложно') }] : []),
        ];
        return [...ordered, ...virtuals];
    }, [folders, folderSortMode, rememberEligibleCount, hardEligibleCount, t, i18n.language]);

    return (
        <StyledWrappedBox>
            <StyledCaptionBox>
                <StyledTypography variant="h6">
                    {t('folders.title')} 
                    <StyledFoldersCounter>
                        {folders.length} / {totalCards}
                    </StyledFoldersCounter>
                </StyledTypography>
                <StyledHeaderActions>
                    <IconButton
                        size="small"
                        aria-label={t('folders.search.label', 'Search')}
                        onClick={() => setSearchOpen(true)}
                    >
                        <SearchIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        aria-label={t('folders.sort.label')}
                        onClick={(event) => setSortAnchorEl(event.currentTarget)}
                    >
                        <SortIcon fontSize="small" />
                    </IconButton>
                    <CreateFolder/>
                </StyledHeaderActions>
            </StyledCaptionBox>
            <Menu
                anchorEl={sortAnchorEl}
                open={Boolean(sortAnchorEl)}
                onClose={() => setSortAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem
                    selected={folderSortMode === 'created_desc'}
                    onClick={() => handleSortModeChange('created_desc')}
                >
                    <ListItemText>{t('folders.sort.createdDesc')}</ListItemText>
                </MenuItem>
                <MenuItem
                    selected={folderSortMode === 'name_asc'}
                    onClick={() => handleSortModeChange('name_asc')}
                >
                    <ListItemText>{t('folders.sort.nameAsc')}</ListItemText>
                </MenuItem>
            </Menu>
            <FolderList
                folders={foldersForUi}
                selectedId={selectedFolderId}
                onSelect={setSelectedFolder}
                onRename={handleRename}
                onDelete={deleteFolder}
                onPinToggle={handlePinToggle}
                onFolderSelect={onFolderSelect}
                folderCardCounts={folderCardCounts}
                hardVirtualCount={hardEligibleCount}
            />
            <SearchCardsDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
        </StyledWrappedBox>
    )
}
