import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { APP_LANGUAGE_OPTIONS } from '@/shared/constants/languages';

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
    const { t } = useTranslation();

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
                    {APP_LANGUAGE_OPTIONS.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code} dense>
                            {lang.label}
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
                    {APP_LANGUAGE_OPTIONS.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code} dense>
                            {lang.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};
