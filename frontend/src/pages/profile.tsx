import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Stack,
    Alert,
    Box,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { ArrowBack, AccountCircle, ContentCopy } from '@mui/icons-material';
import { useAuthStore } from '@/shared/store/authStore';
import { useSEO } from '@/shared/hooks/useSEO';
import { authApi } from '@/shared/api/authApi';
import { ButtonLink } from '@/shared/ui/button-link';
import { ButtonColor, ButtonWhite } from "@/shared/ui";


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

export const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, changePassword, updateLanguage, registerGuest } = useAuthStore();
  const navigate = useNavigate();

  useSEO({
    title: t('seo.profile.title'),
    description: t('seo.profile.description'),
    keywords: t('seo.keywords'),
    lang: i18n.language
  });

  const initialUsername = useMemo(() => user?.username ?? '', [user?.username]);
  const initialLanguage = useMemo(() => user?.language ?? i18n.language ?? 'ru', [user?.language, i18n.language]);

  // Для гостевой регистрации
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestConfirmPassword, setGuestConfirmPassword] = useState('');
  const [guestLanguage, setGuestLanguage] = useState(initialLanguage);
  const [guestSuccess, setGuestSuccess] = useState('');
  const [guestError, setGuestError] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);

  const [username, setUsername] = useState(initialUsername);
  const [language, setLanguage] = useState(initialLanguage);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [languageSuccess, setLanguageSuccess] = useState('');
  const [languageError, setLanguageError] = useState('');
  const [languageLoading, setLanguageLoading] = useState(false);

  const [token, setToken] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);

  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    if (user?.isGuest) {
      setGuestLanguage(user.language || i18n.language || 'ru');
    }
  }, [user?.isGuest, user?.language, i18n.language]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    const trimmedName = username.trim();
    const hasNameChanged = trimmedName !== user.username;

    if (!hasNameChanged) {
      setProfileError(t('profile.nothingToUpdate'));
      return;
    }

    if (trimmedName.length === 0) {
      setProfileError(t('profile.usernameRequired'));
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      await updateProfile({ name: trimmedName });
      setProfileSuccess(t('profile.profileUpdated'));
    } catch (error: any) {
      setProfileError(error.message || t('errors.generic'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLanguageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const currentLanguage = user?.language ?? i18n.language;
    if (language === currentLanguage) {
      setLanguageError(t('profile.nothingToUpdate'));
      return;
    }

    setLanguageLoading(true);
    setLanguageError('');
    setLanguageSuccess('');

    try {
      await updateLanguage(language);
      await i18n.changeLanguage(language);
      setLanguageSuccess(t('profile.languageUpdated'));
    } catch (error: any) {
      setLanguageError(error.message || t('errors.generic'));
    } finally {
      setLanguageLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.passwordMismatch'));
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword({
        oldPassword: currentPassword,
        newPassword
      });

      setPasswordSuccess(t('profile.passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message || t('errors.generic'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGuestRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setGuestSuccess('');
    setGuestError('');

    if (!guestName.trim()) {
      setGuestError(t('profile.usernameRequired'));
      return;
    }

    if (!guestEmail.trim()) {
      setGuestError(t('auth.email') + ' ' + t('auth.required', 'required'));
      return;
    }

    if (guestPassword !== guestConfirmPassword) {
      setGuestError(t('profile.passwordMismatch'));
      return;
    }

    if (guestPassword.length < 6) {
      setGuestError(t('auth.passwordMinLength'));
      return;
    }

    setGuestLoading(true);

    try {
      await registerGuest(guestEmail, guestPassword, guestName, guestLanguage);
      await i18n.changeLanguage(guestLanguage);
      setGuestSuccess(t('profile.registerGuestSuccess'));
      
      // Очищаем форму
      setGuestName('');
      setGuestEmail('');
      setGuestPassword('');
      setGuestConfirmPassword('');
    } catch (error: any) {
      setGuestError(error.message || t('errors.generic'));
    } finally {
      setGuestLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Если пользователь гость, показываем форму регистрации
  if (user.isGuest) {
    return (
      <Box>
        <Container maxWidth="sm" >
          {/* Header */}
          <Box sx={{py: 4}}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <ButtonLink
                startIcon={<ArrowBack/>}
                onClick={() => navigate(-1)}
              >
                {t('forms.back')}
              </ButtonLink>
            </Box>
          </Box>

          <Box sx={{ py: 4 }}>
            <Paper
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box textAlign="center" sx={{ mb: 4 }}>
                <AccountCircle sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold" gutterBottom>
                  {t('profile.registerGuestTitle')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('profile.registerGuestSubtitle')}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleGuestRegister}>
                <Stack spacing={2}>
                  {guestSuccess && <Alert severity="success">{guestSuccess}</Alert>}
                  {guestError && <Alert severity="error">{guestError}</Alert>}

                  <TextField
                    label={t('profile.usernameLabel')}
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label={t('profile.emailLabel')}
                    type="email"
                    value={guestEmail}
                    onChange={(event) => setGuestEmail(event.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label={t('profile.passwordLabel')}
                    type="password"
                    value={guestPassword}
                    onChange={(event) => setGuestPassword(event.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label={t('profile.confirmPassword')}
                    type="password"
                    value={guestConfirmPassword}
                    onChange={(event) => setGuestConfirmPassword(event.target.value)}
                    fullWidth
                    required
                  />

                  <FormControl fullWidth>
                    <InputLabel id="guest-language-label">{t('profile.languageLabel')}</InputLabel>
                    <Select
                      labelId="guest-language-label"
                      label={t('profile.languageLabel')}
                      value={guestLanguage}
                      onChange={(event) => {
                        const newLanguage = event.target.value as string;
                        setGuestLanguage(newLanguage);
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

                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <ButtonColor variant="contained" disabled={guestLoading}>
                      {t('profile.registerGuestButton')}
                    </ButtonColor>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  // Обычная форма профиля для зарегистрированных пользователей
  return (
      <Box>
          <Container maxWidth="sm" >
              {/* Header */}
              <Box sx={{py: 4}}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                      <ButtonLink
                          startIcon={<ArrowBack/>}
                          onClick={() => navigate(-1)}
                      >
                          {t('forms.back')}
                      </ButtonLink>
                  </Box>
              </Box>

              <Box sx={{ py: 4 }}>
                  <Paper
                      sx={{
                          p: 4,
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 3,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                      }}
                  >

                      <Box textAlign="center" sx={{ mb: 4 }}>
                          <AccountCircle sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                          <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold" gutterBottom>
                              {t('profile.title')}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                              {t('profile.subtitle')}
                          </Typography>
                      </Box>

                  <Box sx={{mb: 8}} component="form" onSubmit={handleProfileSubmit}>
                      <Stack spacing={2}>
                          <Typography variant="h6">
                              {t('profile.profileSection')}
                          </Typography>

                          {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}
                          {profileError && <Alert severity="error">{profileError}</Alert>}

                          <TextField
                              label={t('profile.usernameLabel')}
                              value={username}
                              onChange={(event) => setUsername(event.target.value)}
                              fullWidth
                          />

                          <TextField
                              label={t('profile.emailLabel')}
                              value={user.email}
                              disabled
                              fullWidth
                          />

                          <Box display="flex" justifyContent="flex-end" mt={2}>
                              <ButtonColor variant="contained" disabled={profileLoading}>
                                  {t('profile.saveProfile')}
                              </ButtonColor>
                          </Box>
                      </Stack>
                  </Box>

                  <Box sx={{mb: 8}} component="form" onSubmit={handleLanguageSubmit}>
                      <Stack spacing={2}>
                          <Typography variant="h6">
                              {t('profile.languageSection')}
                          </Typography>

                          {languageSuccess && <Alert severity="success">{languageSuccess}</Alert>}
                          {languageError && <Alert severity="error">{languageError}</Alert>}

                          <FormControl fullWidth>
                              <InputLabel id="language-label">{t('profile.languageLabel')}</InputLabel>
                              <Select
                                  labelId="language-label"
                                  label={t('profile.languageLabel')}
                                  value={language}
                                  onChange={(event) => setLanguage(event.target.value as string)}
                              >
                                  {languages.map((lang) => (
                                      <MenuItem key={lang.code} value={lang.code}>
                                          {lang.label}
                                      </MenuItem>
                                  ))}
                              </Select>
                          </FormControl>

                          <Box display="flex" justifyContent="flex-end" mt={2}>
                              <ButtonColor variant="contained" disabled={languageLoading}>
                                  {t('profile.saveLanguage')}
                              </ButtonColor>
                          </Box>
                      </Stack>
                  </Box>

                  <Box sx={{mb: 8}} component="form" onSubmit={handlePasswordSubmit}>
                      <Stack spacing={2}>
                          <Typography variant="h6">
                              {t('profile.passwordSection')}
                          </Typography>

                          {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
                          {passwordError && <Alert severity="error">{passwordError}</Alert>}

                          <TextField
                              label={t('profile.currentPassword')}
                              type="password"
                              value={currentPassword}
                              onChange={(event) => setCurrentPassword(event.target.value)}
                              fullWidth
                              required
                          />

                          <TextField
                              label={t('profile.newPassword')}
                              type="password"
                              value={newPassword}
                              onChange={(event) => setNewPassword(event.target.value)}
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

                          <Box display="flex" justifyContent="flex-end" mt={2}>
                              <ButtonColor variant="outlined" disabled={passwordLoading}>
                                  {t('profile.savePassword')}
                              </ButtonColor>
                          </Box>
                      </Stack>
                  </Box>

                  {/* Блок получения токена */}
                  <Box mt={3}>
                      <Typography variant="h6" gutterBottom>
                          {t('profile.getToken')}
                      </Typography>
                      <TextField
                          label={t('profile.token')}
                          multiline
                          rows={4}
                          value={token}
                          fullWidth
                          disabled
                          sx={{ mt: 2 }}
                      />
                      {tokenError && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                              {tokenError}
                          </Alert>
                      )}
                      <Box display="flex" gap={2} mt={2}>
                          <ButtonColor
                              variant="contained"
                              onClick={async () => {
                                  if (!user?.id) return;
                                  setTokenLoading(true);
                                  setTokenError('');
                                  try {
                                      const newToken = await authApi.getToken(user.id);
                                      setToken(newToken);
                                  } catch (error: any) {
                                      setTokenError(error.response?.data?.error || t('profile.tokenError'));
                                  } finally {
                                      setTokenLoading(false);
                                  }
                              }}
                              disabled={tokenLoading || !user || user.isGuest}
                          >
                              {tokenLoading ? t('profile.creatingToken') : t('profile.createToken')}
                          </ButtonColor>
                          <ButtonWhite
                              variant="outlined"
                              startIcon={<ContentCopy />}
                              onClick={() => {
                                  if (token) {
                                      navigator.clipboard.writeText(token);
                                  }
                              }}
                              disabled={!token}
                          >
                              {t('profile.copyToken')}
                          </ButtonWhite>
                      </Box>
                  </Box>
                  </Paper>
              </Box>
          </Container>
      </Box>
  );
};

