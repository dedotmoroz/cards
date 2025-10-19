import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { HomePage } from '@/pages/home';
import { LearnPage } from '@/pages/learn';
import { SignUpPage } from '@/pages/signup';
import { SignInPage } from '@/pages/signin';
import { NotFoundPage } from '@/pages/404';
import { useAuthStore } from '@/shared/store/authStore';

export default function App() {
    const { checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        // Проверяем аутентификацию только один раз при загрузке приложения
        checkAuth();
    }, []); // Убираем checkAuth из зависимостей

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <BrowserRouter>
            <CssBaseline />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/learn/:folderId" element={<LearnPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}