import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useNavigate } from 'react-router-dom';
import { AuthDialog } from '@/shared/ui/auth-dialog';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleAuthSuccess = () => {
      navigate('/learn');
  };

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.interactiveCards.title'),
      description: t('features.interactiveCards.description')
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.adaptiveLearning.title'),
      description: t('features.adaptiveLearning.description')
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.fastLearning.title'),
      description: t('features.fastLearning.description')
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ py: 4 }}>
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <LanguageSwitcher />
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
                {t('auth.login')}
              </Button>
            </Box>
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
            {t('app.title')}
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            color="white" 
            sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}
          >
            {t('app.tagline')}
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
            {t('buttons.startLearning')}
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
            {t('features.title')}
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
              {t('cta.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('cta.description')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setAuthDialogOpen(true)}
              sx={{ px: 4, py: 1.5 }}
            >
              {t('buttons.enterSystem')}
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
