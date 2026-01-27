import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Alert } from '@mui/material';
import { ButtonColor } from '@/shared/ui';
import {StyledGroupBox, StyledButtonBox, StyledTypography, StyledLabel, StyledTextField} from './styled-components';

interface ProfileSectionProps {
    initialUsername: string;
    userEmail: string;
    onSubmit: (username: string) => Promise<void>;
}

export const ProfileSection = ({ initialUsername, userEmail, onSubmit }: ProfileSectionProps) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState(initialUsername);
    const [lastSavedUsername, setLastSavedUsername] = useState(initialUsername);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUsername(initialUsername);
        setLastSavedUsername(initialUsername);
    }, [initialUsername]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        const trimmedName = username.trim();
        if (trimmedName === lastSavedUsername) {
            setError(t('profile.nothingToUpdate'));
            return;
        }

        if (trimmedName.length === 0) {
            setError(t('profile.usernameRequired'));
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await onSubmit(trimmedName);
            setLastSavedUsername(trimmedName);
            setSuccess(t('profile.profileUpdated'));
        } catch (err: any) {
            setError(err.message || t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <StyledTypography>
                {t('profile.profileSection')}
            </StyledTypography>

            <StyledGroupBox>
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <StyledLabel>
                    {t('profile.usernameLabel')}
                </StyledLabel>
                <StyledTextField
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    fullWidth
                />

                <StyledLabel>
                    {t('profile.emailLabel')}
                </StyledLabel>
                <StyledTextField
                    value={userEmail}
                    disabled
                    fullWidth
                />

                <StyledButtonBox>
                    <ButtonColor variant="contained" type="submit" disabled={loading}>
                        {t('profile.saveProfile')}
                    </ButtonColor>
                </StyledButtonBox>
            </StyledGroupBox>
        </Box>
    );
};
