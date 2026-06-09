import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FOLDER_SIDE_B_LANGUAGE_CODES,
    SIDE_A_LANGUAGE_CODES,
    getFolderLanguageLabel,
    sortLanguageCodesByLabel,
} from '@/shared/constants/languages';

interface FolderLanguageFieldsProps {
    sideALanguage: string;
    sideBLanguage: string;
    onSideALanguageChange: (code: string) => void;
    onSideBLanguageChange: (code: string) => void;
}

export const FolderLanguageFields = ({
    sideALanguage,
    sideBLanguage,
    onSideALanguageChange,
    onSideBLanguageChange,
}: FolderLanguageFieldsProps) => {
    const { t, i18n } = useTranslation();
    const sideACodes = useMemo(
        () => sortLanguageCodesByLabel(SIDE_A_LANGUAGE_CODES, t, i18n.language),
        [t, i18n.language],
    );
    const sideBCodes = useMemo(
        () => sortLanguageCodesByLabel(FOLDER_SIDE_B_LANGUAGE_CODES, t, i18n.language),
        [t, i18n.language],
    );

    return (
        <Box sx={{ display: 'flex', gap: 1.5, mt: '16px', mb: '8px' }}>
            <FormControl fullWidth margin="dense" size="small" sx={{ flex: 1, minWidth: 0 }}>
                <InputLabel id="folder-side-a-language-label">
                    {t('folders.sideALanguage')}
                </InputLabel>
                <Select
                    labelId="folder-side-a-language-label"
                    label={t('folders.sideALanguage')}
                    value={sideALanguage}
                    size="small"
                    onChange={(e) => onSideALanguageChange(e.target.value)}
                >
                    {sideACodes.map((code) => (
                        <MenuItem key={code} value={code} dense>
                            {getFolderLanguageLabel(code, t)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" size="small" sx={{ flex: 1, minWidth: 0 }}>
                <InputLabel id="folder-side-b-language-label">
                    {t('folders.sideBLanguage')}
                </InputLabel>
                <Select
                    labelId="folder-side-b-language-label"
                    label={t('folders.sideBLanguage')}
                    value={sideBLanguage}
                    size="small"
                    onChange={(e) => onSideBLanguageChange(e.target.value)}
                >
                    {sideBCodes.map((code) => (
                        <MenuItem key={code} value={code} dense>
                            {getFolderLanguageLabel(code, t)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};
