import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingPage } from './landing';

// Поддерживаемые языки
const supportedLanguages = ['en', 'ru', 'uk', 'de', 'es', 'fr', 'pl', 'pt', 'zh'];

export const LanguageLandingPage = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, что язык поддерживается
    if (lang && supportedLanguages.includes(lang)) {
      // Устанавливаем язык интерфейса
      i18n.changeLanguage(lang);
    } else {
      // Если язык не поддерживается, редиректим на главную страницу
      navigate('/', { replace: true });
    }
  }, [lang, i18n, navigate]);

  // Если язык не поддерживается, не рендерим ничего (будет редирект)
  if (!lang || !supportedLanguages.includes(lang)) {
    return null;
  }

  // Используем стандартный LandingPage компонент
  return <LandingPage />;
};

