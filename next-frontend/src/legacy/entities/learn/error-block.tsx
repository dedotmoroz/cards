import {Button, Paper, Typography} from "@mui/material";
import {Home} from "@mui/icons-material";
import { useTranslation } from 'react-i18next';
import { backToFolders } from '@/shared/libs/back-to-folders'

interface IErrorBlock {
    error: string
}

export const ErrorBlock  = ({ error }: IErrorBlock) => {
    const { t } = useTranslation();
return (<Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>{t('errors.generic')}: {error}</Typography>
        <Button
            variant="contained"
            startIcon={<Home />}
            onClick={backToFolders}
            sx={{ mt: 2 }}
        >
            {t('forms.back')}
        </Button>
    </Paper>)
}