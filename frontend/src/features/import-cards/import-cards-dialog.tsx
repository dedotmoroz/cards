import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';

interface ImportCardsDialogProps {
    open: boolean;
    folderId: string;
    onClose: () => void;
    onImport: (cards: { question: string; answer: string }[]) => void;
}

export const ImportCardsDialog: React.FC<ImportCardsDialogProps> = ({
    open,
    folderId,
    onClose,
    onImport,
}) => {
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
                throw new Error(`Неверный формат в строке: "${trimmedLine}". Используйте формат "вопрос#ответ"`);
            }
            
            const question = trimmedLine.substring(0, hashIndex).trim();
            const answer = trimmedLine.substring(hashIndex + 1).trim();
            
            if (!question || !answer) {
                throw new Error(`Пустой вопрос или ответ в строке: "${trimmedLine}"`);
            }
            
            cards.push({ question, answer });
        }
        
        return cards;
    };

    const handleImport = async () => {
        if (!text.trim()) {
            setError('Введите текст для импорта');
            return;
        }

        try {
            setError(null);
            setIsImporting(true);
            
            const cards = parseCards(text);
            
            if (cards.length === 0) {
                setError('Не найдено ни одной карточки для импорта');
                return;
            }
            
            await onImport(cards);
            setText('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при парсинге текста');
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
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Импорт карточек</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Вставьте текст в формате: вопрос#ответ;вопрос#ответ
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
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isImporting}>
                    Отмена
                </Button>
                <Button 
                    onClick={handleImport} 
                    variant="contained"
                    disabled={isImporting || !text.trim()}
                >
                    {isImporting ? 'Импорт...' : 'Импорт'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
