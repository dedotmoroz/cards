import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Alert, FormControl, Select, MenuItem } from '@mui/material';
import { ButtonColor } from '@/shared/ui';
import {StyledGroupBox, StyledButtonBox, StyledTypography, StyledLabel} from './styled-components';

import {
    APP_LANGUAGE_OPTIONS,
    getFolderLanguageLabel,
    sortLanguageCodesByLabel,
} from '@/shared/constants/languages';

interface LanguageSectionProps {
    initialLanguage: string;
    onSubmit: (language: string) => Promise<void>;
}

export const LanguageSection = ({ initialLanguage, onSubmit }: LanguageSectionProps) => {
    const { t, i18n } = useTranslation();
    const uiLanguageCodes = useMemo(
        () =>
            sortLanguageCodesByLabel(
                APP_LANGUAGE_OPTIONS.map((lang) => lang.code),
                t,
                i18n.language,
            ),
        [t, i18n.language],
    );
    const [language, setLanguage] = useState(initialLanguage);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLanguage(initialLanguage);
    }, [initialLanguage]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (language === initialLanguage) {
            setError(t('profile.nothingToUpdate'));
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await onSubmit(language);
            setSuccess(t('profile.languageUpdated'));
        } catch (err: any) {
            setError(err.message || t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <StyledTypography>
                {t('profile.languageSection')}
            </StyledTypography>
            <StyledGroupBox>
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <FormControl fullWidth>
                    <StyledLabel>
                        {t('profile.languageLabel')}
                    </StyledLabel>
                    <Select
                        labelId="language-label"
                        value={language}
                        onChange={(event) => setLanguage(event.target.value as string)}
                    >
                        {uiLanguageCodes.map((code) => (
                            <MenuItem key={code} value={code}>
                                {getFolderLanguageLabel(code, t)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <StyledButtonBox>
                    <ButtonColor sx={{mt:2}} variant="contained" type="submit" disabled={loading}>
                        {t('profile.saveLanguage')}
                    </ButtonColor>
                </StyledButtonBox>
            </StyledGroupBox>
        </Box>
    );
};
