import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{t('folders.edit')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t('forms.folderName')}
                    fullWidth
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('auth.cancel')}</Button>
                <Button onClick={handleSave} variant="contained">{t('buttons.save')}</Button>
            </DialogActions>
        </Dialog>
    );
};

