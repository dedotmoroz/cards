import {Button, Paper, Typography} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {Home} from "@mui/icons-material";
import { backToFolders } from '@/shared/libs/back-to-folders'

interface INoticeBlock {
    message: string
}

export const MessageBlock  = ({message}: INoticeBlock) => {
    const { t } = useTranslation();
    const goBackToFolders = backToFolders()

    return (<Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
            {t(message)}
        </Typography>
        <Button
            variant="contained"
            startIcon={<Home />}
            onClick={goBackToFolders}
            sx={{ mt: 2 }}
        >
            {t('forms.back')}
        </Button>
    </Paper>)
}