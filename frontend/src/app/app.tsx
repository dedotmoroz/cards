import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import { HomePage } from '@/pages/home';
import { LearnPage } from '@/pages/learn';

export default function App() {
    return (
        <BrowserRouter>
            <CssBaseline />
            <Container maxWidth="lg">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/learn/:folderId" element={<LearnPage />} />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}