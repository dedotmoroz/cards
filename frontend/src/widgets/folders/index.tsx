import {Box, IconButton, Typography} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {FolderList} from "@/widgets/folders/folder-list.tsx";
import {CreateFolderDialog} from "@/features/create-folder.tsx";
import {useState} from "react";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {useCreateFolder} from "@/features/create-folder/useCreateFolder.ts";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import styles from './style.module.css';

export const Folders = () => {
    const { t } = useTranslation();
    const {
        folders,
        selectedFolderId,
        setSelectedFolder,
        updateFolderName,
        deleteFolder
    } = useFoldersStore();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const { createFolder } = useCreateFolder();

    const handleCreateFolder = async (name: string) => {
        await createFolder(name);
        setIsCreatingFolder(false);
    };

    return (
        <>
            <Box className={styles.paperStyle}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{t('folders.title')} </Typography>
                    <IconButton color="primary" aria-label="create folder"
                                onClick={() => setIsCreatingFolder(true)}>
                        <CreateNewFolderIcon/>
                    </IconButton>
                </Box>

                <FolderList
                    folders={folders}
                    selectedId={selectedFolderId}
                    onSelect={setSelectedFolder}
                    onRename={updateFolderName}
                    onDelete={deleteFolder}
                />
            </Box>
            <CreateFolderDialog
                open={isCreatingFolder}
                onClose={() => setIsCreatingFolder(false)}
                onCreate={handleCreateFolder}
            />
        </>
    )
}