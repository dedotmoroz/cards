import React from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import { FolderLanguageFields } from '@/features/folder-form/folder-language-fields';

interface RenameFolderDialogProps {
    open: boolean;
    folderName: string;
    sideALanguage: string;
    sideBLanguage: string;
    onClose: () => void;
    onSave: (name: string, sideALanguage: string, sideBLanguage: string) => void;
}

export const RenameFolderDialog = ({
    open,
    folderName,
    sideALanguage,
    sideBLanguage,
    onClose,
    onSave,
}: RenameFolderDialogProps) => {
    const { t } = useTranslation();
    const [renameName, setRenameName] = React.useState('');
    const [sideA, setSideA] = React.useState(sideALanguage);
    const [sideB, setSideB] = React.useState(sideBLanguage);

    React.useEffect(() => {
        if (open) {
            setRenameName(folderName);
            setSideA(sideALanguage);
            setSideB(sideBLanguage);
        }
    }, [open, folderName, sideALanguage, sideBLanguage]);

    const handleSave = () => {
        const name = renameName.trim();
        if (!name) {
            onClose();
            return;
        }
        onSave(name, sideA, sideB);
        onClose();
    };

    return (
        <DialogUI
            open={open}
            onClose={onClose}
            title={t('folders.edit')}
            fullWidth
            content={
                <>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('forms.folderName')}
                        fullWidth
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                    />
                    <FolderLanguageFields
                        sideALanguage={sideA}
                        sideBLanguage={sideB}
                        onSideALanguageChange={setSideA}
                        onSideBLanguageChange={setSideB}
                    />
                </>
            }
            actions={
                <>
                    <ButtonUI onClick={onClose}>{t('auth.cancel')}</ButtonUI>
                    <ButtonUI onClick={handleSave} variant="contained">
                        {t('buttons.save')}
                    </ButtonUI>
                </>
            }
        />
    );
};
