import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    TextField,
    Alert,
    MenuItem,
    Select,
    FormControl,
    useMediaQuery,
    useTheme,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ButtonColor } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import {
    StyledFormPaper,
    StyledHeaderBox,
    StyledHeaderIcon,
    StyledButtonBox,
    StyledGuestContainer,
    StyledProfileWrapper,
    StyledLabel,
    StyledProfileContainer,
} from './styled-components';
import { ProfileHeader} from '@/entities/user';

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
    const { user, registerGuest } = useAuthStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <StyledProfileWrapper>
            <StyledProfileContainer>
                <ProfileHeader />

                <StyledGuestContainer>
                    <StyledFormPaper>
                        <StyledHeaderBox>
                            <StyledHeaderIcon />
                            <Typography variant={isMobile ? 'h5' : 'h3'} fontWeight="bold" gutterBottom>
                                {t('profile.registerGuestTitle')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {t('profile.registerGuestSubtitle')}
                            </Typography>
                        </StyledHeaderBox>

                        <Box component="form" onSubmit={handleSubmit}>

                                {success && <Alert severity="success">{success}</Alert>}
                                {error && <Alert severity="error">{error}</Alert>}

                                <StyledLabel>
                                    {t('profile.usernameLabel')}
                                </StyledLabel>
                                <TextField
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    fullWidth
                                    required
                                />

                                <StyledLabel>
                                    {t('profile.emailLabel')}
                                </StyledLabel>
                                <TextField
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    fullWidth
                                    required
                                />

                                <StyledLabel>
                                    {t('profile.passwordLabel')}
                                </StyledLabel>
                                <TextField
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    aria-label={showPassword ? 'hide password' : 'show password'}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <StyledLabel>
                                    {t('auth.confirmPassword')}
                                </StyledLabel>
                                <TextField
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    aria-label={showConfirmPassword ? 'hide password' : 'show password'}
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <FormControl fullWidth>
                                    <StyledLabel>
                                        {t('profile.languageLabel')}
                                    </StyledLabel>
                                    <Select
                                        labelId="guest-language-label"
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
                                    <ButtonColor variant="contained" type="submit" disabled={loading}>
                                        {t('profile.registerGuestButton')}
                                    </ButtonColor>
                                </StyledButtonBox>
                        </Box>
                    </StyledFormPaper>
                </StyledGuestContainer>
            </StyledProfileContainer>
        </StyledProfileWrapper>
    );
};
