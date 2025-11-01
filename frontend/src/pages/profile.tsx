import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '@/shared/store/authStore';

const languages = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' }
];

export const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, changePassword } = useAuthStore();
  const navigate = useNavigate();

  const initialUsername = useMemo(() => user?.username ?? '', [user?.username]);
  const initialLanguage = useMemo(() => user?.language ?? i18n.language ?? 'ru', [user?.language, i18n.language]);

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

  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);

  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);

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
      await updateProfile({ username: trimmedName });
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
      // await updateProfile({ language });
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
        currentPassword,
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

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('forms.back')}
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('profile.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('profile.subtitle')}
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }} component="form" onSubmit={handleProfileSubmit}>
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
              <Button type="submit" variant="contained" disabled={profileLoading}>
                {t('profile.saveProfile')}
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }} component="form" onSubmit={handleLanguageSubmit}>
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
              <Button type="submit" variant="contained" disabled={languageLoading}>
                {t('profile.saveLanguage')}
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Divider />

        <Paper sx={{ p: 3 }} component="form" onSubmit={handlePasswordSubmit}>
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
              <Button type="submit" variant="outlined" disabled={passwordLoading}>
                {t('profile.savePassword')}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

