import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuthStore } from '@/shared/store/authStore';
import { normalizeRegisterError } from '@/shared/libs/authLoginErrors';
import { isValidEmail } from '@/shared/libs/emailValidation';
import { ButtonColor, TextFieldUI } from '@/shared/ui';
import {
  StyledSignUpWrapper,
  StyledSignUpFormSection,
  StyledSignUpPaper,
  StyledSignUpHeaderBox,
  StyledSignUpIcon,
  StyledSignUpTitle,
} from './styled-components';
import { ProfileHeader } from '@/entities/user';

export const SignUpForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!formData.username.trim()) {
      setUsernameError(t('auth.usernameRequired'));
      return;
    }

    if (!formData.email.trim()) {
      setEmailError(t('auth.emailRequired'));
      return;
    }

    if (!isValidEmail(formData.email)) {
      setEmailError(t('auth.emailInvalidFormat'));
      return;
    }

    if (!formData.password.trim()) {
      setPasswordError(t('auth.passwordRequired'));
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError(t('auth.passwordMinLength'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      setTimeout(() => {
        navigate('/learn');
      }, 100);
    } catch (err: unknown) {
      const { field, messageKey } = normalizeRegisterError(err);
      const message = t(messageKey);
      if (field === 'username') setUsernameError(message);
      else if (field === 'email') setEmailError(message);
      else setPasswordError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledSignUpWrapper>
      <Container maxWidth="sm">

          <ProfileHeader navigateTo={'/'} />

        <StyledSignUpFormSection>
          <StyledSignUpPaper>
            <StyledSignUpHeaderBox>
              <StyledSignUpIcon />
              <StyledSignUpTitle variant={isMobile ? 'h5' : 'h4'} gutterBottom>
                {t('auth.register')}
              </StyledSignUpTitle>
            </StyledSignUpHeaderBox>

            <Box component="form" onSubmit={handleSubmit}>
              <TextFieldUI
                fullWidth
                placeholder={t('auth.username')}
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                disabled={isLoading}
                autoFocus
                error={!!usernameError}
                helperText={usernameError}
              />

              <TextFieldUI
                fullWidth
                placeholder={t('auth.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                disabled={isLoading}
                error={!!emailError}
                helperText={emailError}
              />

              <TextFieldUI
                fullWidth
                placeholder={t('auth.password')}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                disabled={isLoading}
                error={!!passwordError}
                helperText={passwordError}
              />

              <TextFieldUI
                fullWidth
                placeholder={t('auth.confirmPassword')}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                disabled={isLoading}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />

              <ButtonColor
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? <CircularProgress size={24} /> : t('auth.register')}
              </ButtonColor>

            </Box>
          </StyledSignUpPaper>
        </StyledSignUpFormSection>
      </Container>
    </StyledSignUpWrapper>
  );
};
