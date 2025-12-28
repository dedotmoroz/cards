import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { HomePage } from '@/pages/home';
import { LearnPage } from '@/pages/learn';
import { SignUpPage } from '@/pages/signup';
import { SignInPage } from '@/pages/signin';
import { LandingPage } from '@/pages/landing';
import { LanguageLandingPage } from '@/pages/language-landing';
import { NotFoundPage } from '@/pages/404';
import { ProfilePage } from '@/pages/profile';
import { useAuthStore } from '@/shared/store/authStore';
import { PageContainer } from '@/shared/ui/page-container';

// Поддерживаемые языки для hreflang
const supportedLanguages = ['en', 'ru', 'uk', 'de', 'es', 'fr', 'pl', 'pt', 'zh'];
const BASE_URL = 'https://kotcat.com';

export default function App() {
    const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Проверяем аутентификацию только один раз при загрузке приложения
        checkAuth();
    }, []); // Убираем checkAuth из зависимостей

    // Добавляем hreflang теги для SEO
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        // Удаляем существующие hreflang теги, если они есть
        const existingLinks = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
        existingLinks.forEach(link => link.remove());

        // Добавляем hreflang теги для всех поддерживаемых языков
        supportedLanguages.forEach(lang => {
            const link = document.createElement('link');
            link.setAttribute('rel', 'alternate');
            link.setAttribute('hreflang', lang);
            link.setAttribute('href', lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}`);
            document.head.appendChild(link);
        });

        // Добавляем x-default тег
        const defaultLink = document.createElement('link');
        defaultLink.setAttribute('rel', 'alternate');
        defaultLink.setAttribute('hreflang', 'x-default');
        defaultLink.setAttribute('href', `${BASE_URL}/`);
        document.head.appendChild(defaultLink);
    }, []);

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
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/learn" element={<HomePage />} />
                            <Route path="/learn/:userId" element={<HomePage />} />
                            <Route path="/learn/:userId/:folderId" element={<HomePage />} />
                            <Route path="/learn/:userId/:folderId/study" element={<PageContainer><LearnPage /></PageContainer>} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/:lang" element={<LanguageLandingPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/signup" element={<SignUpPage />} />
                            <Route path="/signin" element={<SignInPage />} />
                            <Route path="/:lang" element={<LanguageLandingPage />} />
                            <Route path="*" element={<LandingPage />} />
                        </>
                    )}
                </Routes>
            </BrowserRouter>
    );
}