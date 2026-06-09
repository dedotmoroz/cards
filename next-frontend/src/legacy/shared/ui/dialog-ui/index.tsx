import { DialogTitle, DialogContent } from '@mui/material';
import type { DialogProps } from '@mui/material';
import { StyledDialog, StyledDialogActions } from './styled-components';

interface DialogUIProps extends Omit<DialogProps, 'open' | 'onClose' | 'content'> {
    open: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
    actions: React.ReactNode;
}

export const DialogUI = ({ open, onClose, title, content, actions, ...dialogProps }: DialogUIProps) => {
    return (
        <StyledDialog open={open} onClose={onClose} {...dialogProps}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
            <StyledDialogActions>
                {actions}
            </StyledDialogActions>
        </StyledDialog>
    );
};

