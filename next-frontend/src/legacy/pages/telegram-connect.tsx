import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress, 
  Button 
} from '@mui/material';
import { useAuthStore } from '@/shared/store/authStore';
import { authApi } from '@/shared/api/authApi';
import { useSEO } from '@/shared/hooks/useSEO';
import { useTranslation } from 'react-i18next';

export const TelegramConnectPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const nonce = searchParams.get('nonce');

  useSEO({
    title: t('telegram.connect.title', { defaultValue: 'Подключение Telegram' }),
    description: t('telegram.connect.description', { defaultValue: 'Подключение Telegram аккаунта' }),
    keywords: t('seo.keywords'),
    lang: i18n.language
  });

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Ждем завершения проверки авторизации
    if (authLoading) {
      return;
    }

    // Если пользователь не авторизован, перенаправляем на вход
    if (!isAuthenticated) {
      const redirectPath = '/telegram-connect' + (nonce ? `?nonce=${nonce}` : '');
      navigate(`/signin?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
      return;
    }

    // Если нет nonce, показываем ошибку
    if (!nonce) {
      setError(t('telegram.connect.noNonce', { defaultValue: 'Отсутствует параметр nonce. Пожалуйста, перейдите по ссылке из Telegram бота.' }));
      return;
    }

    // Если пользователь авторизован и есть nonce, выполняем привязку (только один раз)
    if (isAuthenticated && nonce && !hasAttempted && !success && !error) {
      handleBind();
    }
  }, [isAuthenticated, authLoading, nonce, hasAttempted, success, error, navigate, t]);

  const handleBind = async () => {
    if (!nonce) return;

    setIsLoading(true);
    setError(null);
    setHasAttempted(true);

    try {
      await authApi.bindTelegram(nonce);
      setSuccess(true);
    } catch (err: any) {
      let errorMessage = t('telegram.connect.error', { defaultValue: 'Ошибка при подключении аккаунта' });
      
      if (err.response?.status === 400) {
        errorMessage = t('telegram.connect.invalidNonce', { defaultValue: 'Неверный или истекший код. Попробуйте снова из Telegram бота.' });
      } else if (err.response?.status === 409) {
        if (err.response?.data?.message?.includes('already has')) {
          errorMessage = t('telegram.connect.userAlreadyBound', { defaultValue: 'У вас уже привязан Telegram аккаунт' });
        } else {
          errorMessage = t('telegram.connect.alreadyBound', { defaultValue: 'Этот Telegram аккаунт уже привязан к другому пользователю' });
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('telegram.connect.title', { defaultValue: 'Подключение Telegram' })}
        </Typography>

        {isLoading && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              {t('telegram.connect.processing', { defaultValue: 'Подключение аккаунта...' })}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <>
            <Alert severity="success" sx={{ mt: 3 }}>
              {t('telegram.connect.success', { defaultValue: 'Telegram аккаунт успешно подключен!' })}
            </Alert>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/learn')}
                sx={{ mr: 2 }}
              >
                {t('telegram.connect.goToApp', { defaultValue: 'Перейти в приложение' })}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  // Пытаемся закрыть окно, если оно было открыто из Telegram
                  if (window.opener) {
                    window.close();
                  } else {
                    navigate('/learn');
                  }
                }}
              >
                {t('telegram.connect.close', { defaultValue: 'Закрыть' })}
              </Button>
            </Box>
          </>
        )}

        {!nonce && !isLoading && !error && !success && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            {t('telegram.connect.noNonce', { defaultValue: 'Отсутствует параметр nonce. Пожалуйста, перейдите по ссылке из Telegram бота.' })}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

