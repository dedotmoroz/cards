// src/features/create-card/ui/create-card-dialog.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField } from '@mui/material';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';

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
        <DialogUI
            open={open}
            onClose={handleClose}
            title={t('forms.newCard')}
            content={
                <>
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
                </>
            }
            actions={
                <>
                    <ButtonUI onClick={handleClose}>{t('auth.cancel')}</ButtonUI>
                    <ButtonUI onClick={handleCreate} variant="contained">
                        {t('forms.add')}
                    </ButtonUI>
                </>
            }
        />
    );
};