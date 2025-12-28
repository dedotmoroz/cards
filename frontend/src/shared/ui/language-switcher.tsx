import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box,
  Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
// import { Language } from '@mui/icons-material';

const languages = [
    {code: 'en', name: 'English', flag: '🇺🇸'},
    {code: 'de', name: 'Deutsch', flag: '🇩🇪'},
    {code: 'es', name: 'Español', flag: '🇪🇸'},
    {code: 'fr', name: 'Français', flag: '🇫🇷'},
    {code: 'pl', name: 'Polski', flag: '🇵🇱'},
    {code: 'pt', name: 'Português', flag: '🇵🇹'},
    {code: 'ru', name: 'Русский', flag: '🇷🇺'},
    {code: 'uk', name: 'Українська', flag: '🇺🇦'},
    {code: 'zh', name: '中文', flag: '🇨🇳'}
];

const supportedLanguages = languages.map(lang => lang.code);

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value;
    
    // Проверяем, находимся ли мы на главной странице (/) или языковой странице (/:lang)
    const pathname = location.pathname;
    const isLandingPage = pathname === '/';
    const isLanguagePage = supportedLanguages.some(lang => pathname === `/${lang}`);
    
    if (isLandingPage || isLanguagePage) {
      // Если на главной или языковой странице, перенаправляем на языковую страницу
      // Английский язык идет на главную страницу (/), остальные на /:lang
      if (newLanguage === 'en') {
        // navigate('/');
        navigate(`/${newLanguage}`);
      } else {
        navigate(`/${newLanguage}`);
      }
    } else {
      // На других страницах просто меняем язык интерфейса
      i18n.changeLanguage(newLanguage);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/*<Language sx={{ color: 'white' }} />*/}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          sx={{
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '& .MuiSelect-icon': {
              color: 'white',
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: 'background.paper',
                '& .MuiMenuItem-root': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }
              }
            }
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Typography component="span" sx={{ mr: 1 }}>
                {lang.flag}
              </Typography>
              <Typography component="span">
                {lang.name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
