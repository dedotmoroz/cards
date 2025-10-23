// src/features/create-card/ui/create-card-dialog.tsx

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

type CreateCardDialogProps = {
    open: boolean;
    folderId: string;
    onClose: () => void;
    onCreate?: (card: { question: string; answer: string; folderId: string }) => void;
};

export const CreateCardDialog: React.FC<CreateCardDialogProps> = ({
                                                                      open,
                                                                      folderId,
                                                                      onClose,
                                                                      onCreate,
                                                                  }) => {
    const { t } = useTranslation();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const handleCreate = () => {
        if (question.trim() && answer.trim()) {
            onCreate?.({
                question: question.trim(),
                answer: answer.trim(),
                folderId,
            });
            setQuestion('');
            setAnswer('');
            onClose();
        }
    };

    const handleClose = () => {
        setQuestion('');
        setAnswer('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{t('forms.newCard')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t('forms.question')}
                    fullWidth
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label={t('forms.answer')}
                    fullWidth
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('auth.cancel')}</Button>
                <Button onClick={handleCreate} variant="contained">
                    {t('forms.add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};