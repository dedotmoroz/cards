import { useTranslation } from 'react-i18next';
import {FolderList} from "@/widgets/folders/folder-list.tsx";
import {CreateFolder} from "@/features/create-folder/index.tsx";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {StyledWrappedBox, StyledCaptionBox, StyledTypography} from "./styled-components.ts";

interface FoldersProps {
    onFolderSelect?: () => void;
}

export const Folders = ({ onFolderSelect }: FoldersProps) => {
    const { t } = useTranslation();
    const {
        folders,
        selectedFolderId,
        setSelectedFolder,
        updateFolderName,
        deleteFolder
    } = useFoldersStore();

    return (
        <StyledWrappedBox>
            <StyledCaptionBox>
                <StyledTypography variant="h6">
                    {t('folders.title')}
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
            />
        </StyledWrappedBox>
    )
}