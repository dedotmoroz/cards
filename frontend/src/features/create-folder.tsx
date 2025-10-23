// src/features/create-folder/ui/create-folder-dialog.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';

type CreateFolderDialogProps = {
    open: boolean;
    onClose: () => void;
    onCreate?: (name: string) => void; // callback при создании
};

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
                                                                          open,
                                                                          onClose,
                                                                          onCreate,
                                                                      }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (name.trim()) {
            onCreate?.(name.trim());
            setName('');
            onClose();
        }
    };

    const handleClose = () => {
        setName('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{t('forms.newFolder')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t('forms.folderName')}
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('auth.cancel')}</Button>
                <Button onClick={handleCreate} variant="contained">
                    {t('forms.create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};