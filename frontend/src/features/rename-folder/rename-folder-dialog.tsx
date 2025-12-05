import React from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';

interface RenameFolderDialogProps {
    open: boolean;
    folderName: string;
    onClose: () => void;
    onSave: (name: string) => void;
}

export const RenameFolderDialog = ({ open, folderName, onClose, onSave }: RenameFolderDialogProps) => {
    const { t } = useTranslation();
    const [renameName, setRenameName] = React.useState('');

    React.useEffect(() => {
        if (open) {
            setRenameName(folderName);
        }
    }, [open, folderName]);

    const handleSave = () => {
        const name = renameName.trim();
        if (!name) {
            onClose();
            return;
        }
        onSave(name);
        onClose();
    };

    return (
        <DialogUI
            open={open}
            onClose={onClose}
            title={t('folders.edit')}
            fullWidth
            content={
                <TextField
                    autoFocus
                    margin="dense"
                    label={t('forms.folderName')}
                    fullWidth
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                />
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

