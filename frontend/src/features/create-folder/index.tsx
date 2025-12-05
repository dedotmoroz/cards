import {useState} from "react";
import { CreateNewFolderIcon } from '@/shared/icons/create-new-folder-icon.tsx'
import { TextField } from "@mui/material";
import {useTranslation} from "react-i18next";
import {useCreateFolder} from "./useCreateFolder.ts";
import { StyledIconButton } from './styled-components.ts'
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';

export const CreateFolder = () => {
    const { t } = useTranslation();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [name, setName] = useState('');

    const { createFolder } = useCreateFolder();

    const handleCreateFolder = async (name: string) => {
        await createFolder(name);
        setIsCreatingFolder(false);
    };

    const handleCreate = () => {
        if (name.trim()) {
            handleCreateFolder?.(name.trim());
            setName('');
            setIsCreatingFolder(false);
        }
    };

    const handleClose = () => {
        setName('');
        setIsCreatingFolder(false);
    };

    return (
        <>
            <StyledIconButton
                aria-label="create folder"
                onClick={() => setIsCreatingFolder(true)}
            >
                <CreateNewFolderIcon/>
            </StyledIconButton>
            <DialogUI
                open={isCreatingFolder}
                onClose={handleClose}
                title={t('forms.newFolder')}
                content={
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('forms.folderName')}
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                }
                actions={
                    <>
                        <ButtonUI onClick={handleClose}>
                            {t('auth.cancel')}
                        </ButtonUI>
                        <ButtonUI onClick={handleCreate}
                                  variant="contained"
                        >
                            {t('forms.create')}
                        </ButtonUI>
                    </>
                }
            />
        </>
    )
}