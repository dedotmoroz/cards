import { AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/shared/ui';

export const HeaderCollection = () => {
    const navigate = useNavigate();

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

