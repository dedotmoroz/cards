import { TextField } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';

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
        <DialogUI
            open={renameOpen}
            onClose={handleRenameCancel}
            title={t('cards.edit')}
            fullWidth
            content={
                <>
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
                </>
            }
            actions={
                <>
                    <ButtonUI onClick={handleRenameCancel}>{t('auth.cancel')}</ButtonUI>
                    <ButtonUI onClick={handleRenameSave} variant="contained">
                        {t('buttons.save')}
                    </ButtonUI>
                </>
            }
        />
    )
}