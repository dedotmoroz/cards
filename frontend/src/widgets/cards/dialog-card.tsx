import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import { useTranslation } from 'react-i18next';

interface DialogCardProps {
    renameOpen: boolean;
    handleRenameCancel: () => void;
    renameQuestion: string;
    setRenameQuestion: (value: string) => void;
    renameAnswer: string;
    setRenameAnswer: (value: string) => void;
    handleRenameSave: () => void;
}

export const DialogCard: React.FC<DialogCardProps> = ({
                               renameOpen,
                               handleRenameCancel,
                               renameQuestion,
                               setRenameQuestion,
                               renameAnswer,
                               setRenameAnswer,
                               handleRenameSave,
                           }) => {
    const { t } = useTranslation();
    return (
        <Dialog open={renameOpen} onClose={handleRenameCancel} fullWidth>
            <DialogTitle>{t('cards.edit')}</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label={t('forms.question')}
                    fullWidth
                    value={renameQuestion}
                    onChange={(e) => setRenameQuestion(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label={t('forms.answer')}
                    fullWidth
                    value={renameAnswer}
                    onChange={(e) => setRenameAnswer(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleRenameCancel}>{t('auth.cancel')}</Button>
                <Button onClick={handleRenameSave} variant="contained">{t('buttons.save')}</Button>
            </DialogActions>
        </Dialog>
    )
}