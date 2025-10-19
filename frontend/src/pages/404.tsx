import { Typography, Button, Box } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
            404
          </Typography>
          <Typography variant="h4" gutterBottom>
            Страница не найдена
          </Typography>
        <Box sx={{ display: 'flex', mt: 4, gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
          >
            На главную
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            size="large"
          >
            Назад
          </Button>
        </Box>
      </Box>
  );
};
