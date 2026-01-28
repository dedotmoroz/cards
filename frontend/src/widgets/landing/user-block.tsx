import {
    Box,
    Button,
} from '@mui/material';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { StyledHeaderTop, StyledLogo } from './styled-components.ts'
import {useTranslation} from "react-i18next";
import {useAuthStore} from "@/shared/store/authStore.ts";
import {useState} from "react";
import {AuthDialog} from "@/entities/user/auth-dialog.tsx";
import {useNavigate} from "react-router-dom";

export const UserBlock = () => {
    const { t } = useTranslation();
    const { isAuthenticated, logout } = useAuthStore();
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    const handleAuthSuccess = () => {
        navigate('/learn');
    };

    return (<>
            <StyledHeaderTop>
                <StyledLogo>
                    <Box
                        component="span"
                    >
                    </Box>
                    {/*<Typography variant="h6" sx={{ml: 1, fontWeight: 'bold'}}>*/}
                    {/*    {t('landing.appName')}*/}
                    {/*</Typography>*/}
                </StyledLogo>
                <Box display="flex" alignItems="center" gap={2}>
                    <LanguageSwitcher/>
                    {isAuthenticated ? (
                        <Button
                            variant="outlined"
                            onClick={handleLogout}
                            sx={{textTransform: 'none', background: '#fff'}}
                        >
                            {t('auth.logout')}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => setAuthDialogOpen(true)}
                            sx={{textTransform: 'none', background: '#000'}}
                        >
                            {t('auth.login')}
                        </Button>
                    )}
                </Box>
            </StyledHeaderTop>
            {/* Auth Dialog */}
            <AuthDialog
                open={authDialogOpen}
                onClose={() => setAuthDialogOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    )
}