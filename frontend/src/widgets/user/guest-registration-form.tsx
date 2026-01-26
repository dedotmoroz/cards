import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Stack,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ButtonLink } from '@/shared/ui/button-link';
import { ButtonColor } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import {
    StyledFormPaper,
    StyledHeaderBox,
    StyledHeaderIcon,
    StyledButtonBox,
    StyledGuestContainer,
    StyledGuestNavigationBox,
    StyledNavigationInner,
} from './styled-components';

const languages = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'uk', label: 'Українська' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'pl', label: 'Polski' },
    { code: 'pt', label: 'Português' },
    { code: 'zh', label: '中文' }
];

export const GuestRegistrationForm = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, registerGuest } = useAuthStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [language, setLanguage] = useState(user?.language || i18n.language || 'ru');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.isGuest) {
            setLanguage(user.language || i18n.language || 'ru');
        }
    }, [user?.isGuest, user?.language, i18n.language]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSuccess('');
        setError('');

        if (!name.trim()) {
            setError(t('profile.usernameRequired'));
            return;
        }

        if (!email.trim()) {
            setError(t('auth.email') + ' ' + t('auth.required', 'required'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('profile.passwordMismatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('auth.passwordMinLength'));
            return;
        }

        setLoading(true);

        try {
            await registerGuest(email, password, name, language);
            await i18n.changeLanguage(language);
            setSuccess(t('profile.registerGuestSuccess'));
            
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Container maxWidth="sm">
                <StyledGuestNavigationBox>
                    <StyledNavigationInner>
                        <ButtonLink
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(-1)}
                        >
                            {t('forms.back')}
                        </ButtonLink>
                    </StyledNavigationInner>
                </StyledGuestNavigationBox>

                <StyledGuestContainer>
                    <StyledFormPaper>
                        <StyledHeaderBox>
                            <StyledHeaderIcon />
                            <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold" gutterBottom>
                                {t('profile.registerGuestTitle')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {t('profile.registerGuestSubtitle')}
                            </Typography>
                        </StyledHeaderBox>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                {success && <Alert severity="success">{success}</Alert>}
                                {error && <Alert severity="error">{error}</Alert>}

                                <TextField
                                    label={t('profile.usernameLabel')}
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    fullWidth
                                    required
                                />

                                <TextField
                                    label={t('profile.emailLabel')}
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    fullWidth
                                    required
                                />

                                <TextField
                                    label={t('profile.passwordLabel')}
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    fullWidth
                                    required
                                />

                                <TextField
                                    label={t('profile.confirmPassword')}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    fullWidth
                                    required
                                />

                                <FormControl fullWidth>
                                    <InputLabel id="guest-language-label">{t('profile.languageLabel')}</InputLabel>
                                    <Select
                                        labelId="guest-language-label"
                                        label={t('profile.languageLabel')}
                                        value={language}
                                        onChange={(event) => {
                                            const newLanguage = event.target.value as string;
                                            setLanguage(newLanguage);
                                            i18n.changeLanguage(newLanguage);
                                        }}
                                    >
                                        {languages.map((lang) => (
                                            <MenuItem key={lang.code} value={lang.code}>
                                                {lang.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <StyledButtonBox>
                                    <ButtonColor variant="contained" disabled={loading}>
                                        {t('profile.registerGuestButton')}
                                    </ButtonColor>
                                </StyledButtonBox>
                            </Stack>
                        </Box>
                    </StyledFormPaper>
                </StyledGuestContainer>
            </Container>
        </Box>
    );
};
