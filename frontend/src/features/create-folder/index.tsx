import { useState, useEffect, useRef } from 'react';
import { CreateNewFolderIcon } from '@/shared/icons/create-new-folder-icon.tsx';
import { TextField, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCreateFolder } from './useCreateFolder.ts';
import { StyledIconButton } from './styled-components.ts';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import { FolderLanguageFields } from '@/features/folder-form/folder-language-fields';
import {
    getDefaultSideALanguage,
    getDefaultSideBLanguage,
} from '@/shared/libs/folder-languages';

export const CreateFolder = () => {
    const { t, i18n } = useTranslation();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [name, setName] = useState('');
    const [sideALanguage, setSideALanguage] = useState(() =>
        getDefaultSideALanguage(i18n.language),
    );
    const [sideBLanguage, setSideBLanguage] = useState(() =>
        getDefaultSideBLanguage(i18n.language),
    );
    const nameInputRef = useRef<HTMLInputElement>(null);

    const { createFolder } = useCreateFolder();

    useEffect(() => {
        if (isCreatingFolder) {
            setSideALanguage(getDefaultSideALanguage(i18n.language));
            setSideBLanguage(getDefaultSideBLanguage(i18n.language));
        }
    }, [isCreatingFolder, i18n.language]);

    useEffect(() => {
        if (!isCreatingFolder) return;
        const timer = setTimeout(() => {
            nameInputRef.current?.focus();
        }, 0);
        return () => clearTimeout(timer);
    }, [isCreatingFolder]);

    const handleCreateFolder = async (
        name: string,
        sideALanguage: string,
        sideBLanguage: string,
    ) => {
        await createFolder({ name, sideALanguage, sideBLanguage });
        setIsCreatingFolder(false);
    };

    const handleCreate = () => {
        if (name.trim()) {
            handleCreateFolder(name.trim(), sideALanguage, sideBLanguage);
            setName('');
            setIsCreatingFolder(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCreate();
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
                <CreateNewFolderIcon />
            </StyledIconButton>
            <DialogUI
                open={isCreatingFolder}
                onClose={handleClose}
                title={t('forms.newFolder')}
                content={
                    <Box
                        component="form"
                        id="create-folder-form"
                        onSubmit={handleSubmit}
                    >
                        <TextField
                            margin="dense"
                            label={t('forms.folderName')}
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            inputRef={nameInputRef}
                        />
                        <FolderLanguageFields
                            sideALanguage={sideALanguage}
                            sideBLanguage={sideBLanguage}
                            onSideALanguageChange={setSideALanguage}
                            onSideBLanguageChange={setSideBLanguage}
                        />
                    </Box>
                }
                actions={
                    <>
                        <ButtonUI onClick={handleClose}>
                            {t('auth.cancel')}
                        </ButtonUI>
                        <ButtonUI
                            type="submit"
                            form="create-folder-form"
                            variant="contained"
                        >
                            {t('forms.create')}
                        </ButtonUI>
                    </>
                }
            />
        </>
    );
};
