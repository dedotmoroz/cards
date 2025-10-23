import {Box, IconButton, Paper, Typography} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {FolderList} from "@/widgets/folders/folder-list.tsx";
import {CreateFolderDialog} from "@/features/create-folder.tsx";
import {useState} from "react";
import {useCardsStore} from "@/shared/store/cardsStore.ts";
import {useCreateFolder} from "@/features/create-folder/useCreateFolder.ts";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

export const Folders = () => {
    const { t } = useTranslation();
    const {
        folders,
        selectedFolderId,
        setSelectedFolder,
        updateFolderName,
        deleteFolder
    } = useCardsStore();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const { createFolder } = useCreateFolder();

    const handleCreateFolder = async (name: string) => {
        await createFolder(name);
        setIsCreatingFolder(false);
    };

    return (
        <><Paper sx={{p: 2, height: '100%'}}>
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
        </Paper>

            <CreateFolderDialog
                open={isCreatingFolder}
                onClose={() => setIsCreatingFolder(false)}
                onCreate={handleCreateFolder}
            /></>
    )
}