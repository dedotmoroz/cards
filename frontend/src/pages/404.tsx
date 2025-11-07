import { Typography, Button, Box } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO } from '@/shared/hooks/useSEO';

export const NotFoundPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/learn');
  const handleGoBack = () => navigate(-1);

  useSEO({
    title: t('seo.notFound.title'),
    description: t('seo.notFound.description'),
    keywords: t('seo.keywords'),
    lang: i18n.language,
    noindex: true
  });

  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
            404
          </Typography>
          <Typography variant="h4" gutterBottom>
            {t('errors.notFound')}
          </Typography>
        <Box sx={{ display: 'flex', mt: 4, gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
          >
            {t('navigation.home')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            size="large"
          >
            {t('forms.back')}
          </Button>
        </Box>
      </Box>
  );
};
