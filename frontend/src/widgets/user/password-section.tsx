import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Alert, Box, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ButtonColor } from '@/shared/ui';
import {StyledGroupBox, StyledButtonBox, StyledTypography, StyledLabel} from './styled-components';

interface PasswordSectionProps {
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const PasswordSection = ({ onSubmit }: PasswordSectionProps) => {
    const { t } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSuccess('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError(t('profile.passwordMismatch'));
            return;
        }

        setLoading(true);

        try {
            await onSubmit(currentPassword, newPassword);
            setSuccess(t('profile.passwordUpdated'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>

            <StyledTypography>
                {t('profile.passwordSection')}
            </StyledTypography>

            <StyledGroupBox>
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <StyledLabel>
                    {t('profile.currentPassword')}
                </StyledLabel>
                <TextField
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    fullWidth
                    required
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    edge="end"
                                    aria-label={showCurrentPassword ? 'hide password' : 'show password'}
                                >
                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <StyledLabel>
                    {t('profile.newPassword')}
                </StyledLabel>
                <TextField
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    fullWidth
                    required
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    edge="end"
                                    aria-label={showNewPassword ? 'hide password' : 'show password'}
                                >
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <StyledLabel>
                    {t('profile.confirmPassword')}
                </StyledLabel>
                <TextField
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    fullWidth
                    required
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                    aria-label={showConfirmPassword ? 'hide password' : 'show password'}
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <StyledButtonBox>
                    <ButtonColor variant="outlined" type="submit" disabled={loading}>
                        {t('profile.savePassword')}
                    </ButtonColor>
                </StyledButtonBox>

            </StyledGroupBox>
        </Box>
    );
};
