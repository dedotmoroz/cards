import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { ButtonColor, ButtonWhite } from '@/shared/ui';
import { authApi } from '@/shared/api/authApi';
import {
    StyledGroupBox,
    StyledButtonsRow,
    StyledTokenField,
    StyledTypography,
    StyledLabel,
} from './styled-components';

interface TokenSectionProps {
    userId: string;
    isGuest: boolean;
}

export const TokenSection = ({ userId, isGuest }: TokenSectionProps) => {
    const { t } = useTranslation();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetToken = async () => {
        if (!userId) return;
        
        setLoading(true);
        setError('');
        
        try {
            const newToken = await authApi.getToken(userId);
            setToken(newToken);
        } catch (err: any) {
            setError(err.response?.data?.error || t('profile.tokenError'));
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token);
        }
    };

    return (
        <Box>
            <StyledTypography>
                {t('profile.getToken')}
            </StyledTypography>
            <StyledGroupBox>
                <StyledLabel>
                    {t('profile.token')}
                </StyledLabel>
                <StyledTokenField
                    multiline
                    rows={4}
                    value={token}
                    fullWidth
                    disabled
                />

                {error && (
                    <Alert severity="error" sx={{mt: 2}}>
                        {error}
                    </Alert>
                )}

                <StyledButtonsRow>
                    <ButtonColor
                        variant="contained"
                        onClick={handleGetToken}
                        disabled={loading || !userId || isGuest}
                    >
                        {loading ? t('profile.creatingToken') : t('profile.createToken')}
                    </ButtonColor>
                    <ButtonWhite
                        variant="outlined"
                        startIcon={<ContentCopy/>}
                        onClick={handleCopyToken}
                        disabled={!token}
                    >
                        {t('profile.copyToken')}
                    </ButtonWhite>
                </StyledButtonsRow>
            </StyledGroupBox>
        </Box>
    );
};
