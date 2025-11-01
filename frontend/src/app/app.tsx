import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { HomePage } from '@/pages/home';
import { LearnPage } from '@/pages/learn';
import { SignUpPage } from '@/pages/signup';
import { SignInPage } from '@/pages/signin';
import { LandingPage } from '@/pages/landing';
import { NotFoundPage } from '@/pages/404';
import { ProfilePage } from '@/pages/profile';
import { useAuthStore } from '@/shared/store/authStore';
import { PageContainer } from '@/shared/ui/page-container';

export default function App() {
    const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

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
                    {isAuthenticated ? (
                        <>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/learn/:folderId" element={<PageContainer><LearnPage /></PageContainer>} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/signup" element={<SignUpPage />} />
                            <Route path="/signin" element={<SignInPage />} />
                            <Route path="*" element={<LandingPage />} />
                        </>
                    )}
                </Routes>
            </BrowserRouter>
    );
}