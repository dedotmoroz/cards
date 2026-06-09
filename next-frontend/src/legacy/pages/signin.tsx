import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuthStore } from '@/shared/store/authStore';
import { useSEO } from '@/shared/hooks/useSEO';
import { GOOGLE_CLIENT_ID } from '@/shared/config/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, config: { theme?: string; size?: string; width?: number; text?: string }) => void;
        };
      };
    };
  }
}

export const SignInPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSignInRef = useRef<(credential: string) => Promise<void>>(async () => {});
  handleGoogleSignInRef.current = async (credential: string) => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle(credential);
      const redirectPath = searchParams.get('redirect') || '/learn';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidCredentials'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    const initGoogleButton = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential: string }) => {
            handleGoogleSignInRef.current(response.credential);
          }
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with'
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleButton();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGoogleButton();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      // Перенаправляем на указанный путь или на /learn по умолчанию
      const redirectPath = searchParams.get('redirect') || '/learn';
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      setError(error.message || t('auth.invalidCredentials'));
      setIsLoading(false);
    }
  };

  useSEO({
    title: t('seo.signin.title'),
    description: t('seo.signin.description'),
    keywords: t('seo.keywords'),
    lang: i18n.language,
    noindex: true
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('auth.login')}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('auth.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isLoading}
          />
          
          <TextField
            fullWidth
            label={t('auth.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : t('auth.login')}
          </Button>

          {GOOGLE_CLIENT_ID && (
            <>
              <Divider sx={{ my: 2 }}>{t('auth.or')}</Divider>
              <Box sx={{ display: 'flex', justifyContent: 'center', opacity: isGoogleLoading ? 0.6 : 1 }}>
                <div ref={googleButtonRef} />
              </Box>
            </>
          )}
          
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {t('auth.noAccount')}{' '}
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                {t('auth.registerLink')}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
