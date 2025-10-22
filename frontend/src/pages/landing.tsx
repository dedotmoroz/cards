import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  School, 
  Psychology, 
  Speed, 
  Login,
  AutoAwesome
} from '@mui/icons-material';
import { AuthDialog } from '@/widgets/sign-up/auth-dialog.tsx';

export const LandingPage = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleAuthSuccess = () => {
    // Перенаправление произойдет автоматически через authStore
    window.location.href = '/';
  };

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Интерактивные карточки',
      description: 'Создавайте и изучайте карточки с вопросами и ответами'
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Адаптивное обучение',
      description: 'Система запоминает ваши результаты и адаптирует процесс'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Быстрое изучение',
      description: 'Эффективные методы запоминания для быстрого освоения материала'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ py: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight="bold" color="white">
              Запоминай!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={() => setAuthDialogOpen(true)}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Войти
            </Button>
          </Box>
        </Box>

        {/* Hero Section */}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            fontWeight="bold" 
            color="white" 
            gutterBottom
            sx={{ mb: 3 }}
          >
            Запоминай!
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            color="white" 
            sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}
          >
            Эффективная система изучения с помощью карточек. 
            Запоминайте информацию быстрее и надолго.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AutoAwesome />}
            onClick={() => setAuthDialogOpen(true)}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
                boxShadow: 4
              },
              transition: 'all 0.3s ease'
            }}
          >
            Начать изучение
          </Button>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h4" 
            textAlign="center" 
            color="white" 
            fontWeight="bold" 
            gutterBottom
            sx={{ mb: 6 }}
          >
            Почему выбирают нас
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" color="white" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Paper 
            sx={{ 
              p: 4, 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Готовы начать запоминать?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Присоединяйтесь к тысячам пользователей, которые уже улучшили свою память
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setAuthDialogOpen(true)}
              sx={{ px: 4, py: 1.5 }}
            >
              Войти в систему
            </Button>
          </Paper>
        </Box>
      </Container>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </Box>
  );
};
