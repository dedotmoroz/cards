import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TextField,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';

interface ImportCardsDialogProps {
    open: boolean;
    folderId: string;
    onClose: () => void;
    onImport: (cards: { question: string; answer: string }[]) => void;
}

export const ImportCardsDialog: React.FC<ImportCardsDialogProps> = ({
    open,
    onClose,
    onImport,
}) => {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const parseCards = (inputText: string): { question: string; answer: string }[] => {
        const cards: { question: string; answer: string }[] = [];
        const lines = inputText.trim().split(';');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            const hashIndex = trimmedLine.indexOf('#');
            if (hashIndex === -1) {
                throw new Error(`${t('import.format')}: "${trimmedLine}"`);
            }
            
            const question = trimmedLine.substring(0, hashIndex).trim();
            const answer = trimmedLine.substring(hashIndex + 1).trim();
            
            if (!question || !answer) {
                throw new Error(`${t('forms.question')} ${t('forms.answer')}: "${trimmedLine}"`);
            }
            
            cards.push({ question, answer });
        }
        
        return cards;
    };

    const handleImport = async () => {
        if (!text.trim()) {
            setError(t('import.selectFile'));
            return;
        }

        try {
            setError(null);
            setIsImporting(true);
            
            const cards = parseCards(text);
            
            if (cards.length === 0) {
                setError(t('import.title'));
                return;
            }
            
            await onImport(cards);
            setText('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.generic'));
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setText('');
        setError(null);
        onClose();
    };

    return (
        <DialogUI
            open={open}
            onClose={handleClose}
            title={t('import.title')}
            maxWidth="md"
            fullWidth
            content={
                <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('import.format')}
                    </Typography>
                    
                    <TextField
                        multiline
                        rows={8}
                        fullWidth
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="downside#Отрицательный момент в том, что;profound#глубокий, основательный;be in charge of something#быть ответственным за что-то"
                        variant="outlined"
                    />
                    
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Пример формата:
                        </Typography>
                        <Box component="pre" sx={{ 
                            mt: 1, 
                            p: 1, 
                            bgcolor: 'grey.100', 
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontFamily: 'monospace'
                        }}>
                            downside#Отрицательный момент в том, что{'\n'}
                            profound#глубокий, основательный{'\n'}
                            be in charge of something#быть ответственным за что-то
                        </Box>
                    </Box>
                </>
            }
            actions={
                <>
                    <ButtonUI onClick={handleClose} disabled={isImporting}>
                        {t('auth.cancel')}
                    </ButtonUI>
                    <ButtonUI 
                        onClick={handleImport} 
                        variant="contained"
                        disabled={isImporting || !text.trim()}
                    >
                        {isImporting ? t('import.import') + '...' : t('import.import')}
                    </ButtonUI>
                </>
            }
        />
    );
};
