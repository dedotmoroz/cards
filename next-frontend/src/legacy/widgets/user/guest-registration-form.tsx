import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Alert,
    MenuItem,
    Select,
    FormControl,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { ButtonColor, TextFieldUI } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { normalizeRegisterError } from '@/shared/libs/authLoginErrors';
import { isValidEmail } from '@/shared/libs/emailValidation';
import {
    StyledFormPaper,
    StyledHeaderBox,
    StyledHeaderIcon,
    StyledButtonBox,
    StyledGuestContainer,
    StyledProfileWrapper,
    StyledLabel,
    StyledProfileContainer,
    StyledTurnStileBox,
} from './styled-components';
import { ProfileHeader } from '@/entities/user';
import { TURNSTILE_SITE_KEY } from '@/shared/config/turnstile';

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
    const turnstileRef = useRef<HTMLDivElement>(null);
    const turnstileWidgetId = useRef<string | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [language, setLanguage] = useState(user?.language || i18n.language || 'ru');
    const [success, setSuccess] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.isGuest) {
            setLanguage(user.language || i18n.language || 'ru');
        }
    }, [user?.isGuest, user?.language, i18n.language]);

    useEffect(() => {
        if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;
        const mountWidget = () => {
            if (!turnstileRef.current || !window.turnstile) return;
            turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
                sitekey: TURNSTILE_SITE_KEY,
                callback: (token: string) => {
                    setTurnstileToken(token);
                    setCaptchaError('');
                },
            });
        };
        if (window.turnstile) {
            mountWidget();
        } else {
            const id = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(id);
                    mountWidget();
                }
            }, 100);
            return () => {
                clearInterval(id);
                if (turnstileWidgetId.current && window.turnstile) {
                    window.turnstile.remove(turnstileWidgetId.current);
                    turnstileWidgetId.current = null;
                }
            };
        }
        return () => {
            if (turnstileWidgetId.current && window.turnstile) {
                window.turnstile.remove(turnstileWidgetId.current);
                turnstileWidgetId.current = null;
            }
        };
    }, []);

    const clearFieldErrors = () => {
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSuccess('');
        clearFieldErrors();

        if (!name.trim()) {
            setNameError(t('auth.usernameRequired'));
            return;
        }

        if (!email.trim()) {
            setEmailError(t('auth.emailRequired'));
            return;
        }

        if (!isValidEmail(email)) {
            setEmailError(t('auth.emailInvalidFormat'));
            return;
        }

        if (!password.trim()) {
            setPasswordError(t('auth.passwordRequired'));
            return;
        }

        if (password.length < 6) {
            setPasswordError(t('auth.passwordMinLength'));
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError(t('auth.passwordMismatch'));
            return;
        }

        setLoading(true);

        try {
            await registerGuest(email, password, name, language, turnstileToken || undefined);
            await i18n.changeLanguage(language);
            setSuccess(t('profile.registerGuestSuccess'));
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => navigate('/learn'), 100);
        } catch (err: unknown) {
            const { field, messageKey } = normalizeRegisterError(err);
            const message = t(messageKey);
            if (field === 'username') setNameError(message);
            else if (field === 'email') setEmailError(message);
            else setPasswordError(message);
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
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
                                {t('profile.registerGuestTitle')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {t('profile.registerGuestSubtitle')}
                            </Typography>
                        </StyledHeaderBox>

                        <Box component="form" onSubmit={handleSubmit}>

                                {success && <Alert severity="success">{success}</Alert>}

                                <StyledLabel>
                                    {t('profile.usernameLabel')}
                                </StyledLabel>
                                <TextFieldUI
                                    value={name}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        setNameError('');
                                    }}
                                    fullWidth
                                    required
                                    disabled={loading}
                                    error={!!nameError}
                                    helperText={nameError}
                                />

                                <StyledLabel>
                                    {t('profile.emailLabel')}
                                </StyledLabel>
                                <TextFieldUI
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setEmailError('');
                                    }}
                                    fullWidth
                                    required
                                    disabled={loading}
                                    error={!!emailError}
                                    helperText={emailError}
                                />

                                <StyledLabel>
                                    {t('profile.passwordLabel')}
                                </StyledLabel>
                                <TextFieldUI
                                    type="password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setPasswordError('');
                                    }}
                                    fullWidth
                                    required
                                    disabled={loading}
                                    error={!!passwordError}
                                    helperText={passwordError}
                                />

                                <StyledLabel>
                                    {t('auth.confirmPassword')}
                                </StyledLabel>
                                <TextFieldUI
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => {
                                        setConfirmPassword(event.target.value);
                                        setConfirmPasswordError('');
                                    }}
                                    fullWidth
                                    required
                                    disabled={loading}
                                    error={!!confirmPasswordError}
                                    helperText={confirmPasswordError}
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
                                    <ButtonColor
                                        sx={{mt: 2, mb: 2}}
                                        variant="contained"
                                        type="submit"
                                        disabled={loading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
                                        onClick={handleSubmit}
                                    >
                                        {t('profile.registerGuestButton')}
                                    </ButtonColor>
                                </StyledButtonBox>

                            {TURNSTILE_SITE_KEY && (
                                <StyledTurnStileBox>
                                    <div ref={turnstileRef} />
                                    {captchaError && (
                                        <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', display: 'block', mt: 0.5 }}>
                                            {captchaError}
                                        </Box>
                                    )}
                                </StyledTurnStileBox>
                            )}
                        </Box>
                    </StyledFormPaper>
                </StyledGuestContainer>
            </StyledProfileContainer>
        </StyledProfileWrapper>
    );
};
