import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {FolderList} from "@/widgets/folders/folder-list.tsx";
import {CreateFolder} from "@/features/create-folder/index.tsx";
import { useFoldersStore, REMEMBER_VIRTUAL_MIN_TOTAL_CARDS } from '@/shared/store/foldersStore.ts';
import {StyledWrappedBox, StyledCaptionBox, StyledTypography, StyledFoldersCounter} from "./styled-components.ts";

interface FoldersProps {
    onFolderSelect?: () => void;
}

export const Folders = ({ onFolderSelect }: FoldersProps) => {
    const { t } = useTranslation();
    const {
        folders,
        folderCardCounts,
        rememberEligibleCount,
        hardEligibleCount,
        selectedFolderId,
        setSelectedFolder,
        updateFolderName,
        deleteFolder
    } = useFoldersStore();

    const totalCards = useMemo(
        () => Object.values(folderCardCounts ?? {}).reduce((sum, n) => sum + (n ?? 0), 0),
        [folderCardCounts]
    );

    const foldersForUi = useMemo(() => {
        const ordered = [...folders].reverse();
        // null = счётчик ещё не пришёл с API — не скрываем папку до ответа (иначе «пропадает» при задержке/ошибке)
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
    }, [folders, rememberEligibleCount, hardEligibleCount, t]);

    return (
        <StyledWrappedBox>
            <StyledCaptionBox>
                <StyledTypography variant="h6">
                    {t('folders.title')} 
                    <StyledFoldersCounter>
                        {folders.length} / {totalCards}
                    </StyledFoldersCounter>
                </StyledTypography>
                <CreateFolder/>
            </StyledCaptionBox>
            <FolderList
                folders={foldersForUi}
                selectedId={selectedFolderId}
                onSelect={setSelectedFolder}
                onRename={updateFolderName}
                onDelete={deleteFolder}
                onFolderSelect={onFolderSelect}
                folderCardCounts={folderCardCounts}
                hardVirtualCount={hardEligibleCount}
            />
        </StyledWrappedBox>
    )
}