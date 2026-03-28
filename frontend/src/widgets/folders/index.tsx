import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {FolderList} from "@/widgets/folders/folder-list.tsx";
import {CreateFolder} from "@/features/create-folder/index.tsx";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {StyledWrappedBox, StyledCaptionBox, StyledTypography, StyledFoldersCounter} from "./styled-components.ts";

interface FoldersProps {
    onFolderSelect?: () => void;
}

export const Folders = ({ onFolderSelect }: FoldersProps) => {
    const { t } = useTranslation();
    const {
        folders,
        folderCardCounts,
        selectedFolderId,
        setSelectedFolder,
        updateFolderName,
        deleteFolder
    } = useFoldersStore();

    const totalCards = useMemo(
        () => Object.values(folderCardCounts ?? {}).reduce((sum, n) => sum + (n ?? 0), 0),
        [folderCardCounts]
    );

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
                folders={folders}
                selectedId={selectedFolderId}
                onSelect={setSelectedFolder}
                onRename={updateFolderName}
                onDelete={deleteFolder}
                onFolderSelect={onFolderSelect}
                folderCardCounts={folderCardCounts}
            />
        </StyledWrappedBox>
    )
}