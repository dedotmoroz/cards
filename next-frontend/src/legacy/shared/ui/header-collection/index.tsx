import { AppBar, Toolbar } from '@mui/material';
import { useAppNavigate } from '@/shared/libs/use-app-navigate';
import { Logo } from '@/shared/ui';

export const HeaderCollection = () => {
    const navigate = useAppNavigate();

    const goToHome = () => {
        navigate('/');
    };

    return (
        <AppBar position="fixed">
            <Toolbar>
                <Logo handle={goToHome} handleGoMain={goToHome} />
            </Toolbar>
        </AppBar>
    );
};

