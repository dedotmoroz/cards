import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ButtonColor } from '@/shared/ui';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { useAuthStore } from '@/shared/store/authStore';
import { StyledGroupBox, StyledButtonBox } from './styled-components';

export const DeleteAccountSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { deleteAccount } = useAuthStore();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDeleteClick = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        if (isDeleting) return;
        setDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setError('');
        try {
            await deleteAccount();
            navigate('/');
        } catch (err: any) {
            setError(err?.message ?? t('errors.generic'));
        } finally {
            setIsDeleting(false);
            setDialogOpen(false);
        }
    };

    return (
        <Box>
            <StyledGroupBox>
                <Typography variant="h6">
                    {t('profile.deleteAccountTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('profile.deleteAccountDescription')}
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <StyledButtonBox>
                    <ButtonColor
                        sx={{ mt: 2, background: '#d32f2f' }}
                        variant="contained"
                        onClick={handleDeleteClick}
                    >
                        {t('profile.deleteAccountButton')}
                    </ButtonColor>
                </StyledButtonBox>
            </StyledGroupBox>

            <DialogUI
                open={dialogOpen}
                onClose={handleDialogClose}
                title={t('profile.deleteAccountConfirmTitle')}
                content={
                    <Typography variant="body1">
                        {t('profile.deleteAccountConfirmText')}
                    </Typography>
                }
                actions={
                    <>
                        <Button onClick={handleDialogClose} disabled={isDeleting}>
                            {t('buttons.cancel')}
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('profile.deletingAccount') : t('profile.deleteAccountButton')}
                        </Button>
                    </>
                }
            />
        </Box>
    );
};
