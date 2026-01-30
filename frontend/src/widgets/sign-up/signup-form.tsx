import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuthStore } from '@/shared/store/authStore';
import { ButtonColor, TextFieldUI } from '@/shared/ui';
import {
  StyledSignUpWrapper,
  StyledSignUpFormSection,
  StyledSignUpPaper,
  StyledSignUpHeaderBox,
  StyledSignUpIcon,
  StyledSignUpTitle,
} from './styled-components';
import { ProfileHeader} from '@/entities/user';

export const SignUpForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
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
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      setTimeout(() => {
        navigate('/learn');
      }, 100);
    } catch (err: unknown) {
      setError((err as Error)?.message || t('errors.generic'));
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

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

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
              />

              <ButtonColor
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
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
