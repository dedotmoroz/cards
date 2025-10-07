import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";

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
    return (
        <Dialog open={renameOpen} onClose={handleRenameCancel} fullWidth>
            <DialogTitle>Редактировать карточку</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Вопрос"
                    fullWidth
                    value={renameQuestion}
                    onChange={(e) => setRenameQuestion(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Ответ"
                    fullWidth
                    value={renameAnswer}
                    onChange={(e) => setRenameAnswer(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleRenameCancel}>Отмена</Button>
                <Button onClick={handleRenameSave} variant="contained">Сохранить</Button>
            </DialogActions>
        </Dialog>
    )
}