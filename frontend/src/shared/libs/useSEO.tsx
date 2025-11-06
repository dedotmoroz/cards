import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  noindex?: boolean;
}

/**
 * Хук для управления SEO мета-тегами страницы
 */
export const useSEO = (props: SEOProps = {}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = `${baseUrl}${location.pathname}`;
  const currentLang = i18n.language || 'ru';
  
  // Значения по умолчанию
  const defaultTitle = t('app.title');
  const defaultDescription = t('app.tagline');
  
  const title = props.title 
    ? `${props.title} | ${defaultTitle}` 
    : defaultTitle;
  
  const description = props.description || defaultDescription;
  const keywords = props.keywords || t('seo.keywords', { defaultValue: 'flashcards, learning, memory, education, study' });
  const image = props.image || `${baseUrl}/og-image.jpg`; // Можно добавить позже
  
  return {
    title,
    description,
    keywords,
    image,
    url: currentUrl,
    lang: currentLang,
    noindex: props.noindex || false,
  };
};

/**
 * Компонент для установки SEO мета-тегов
 */
export const SEO = (props: SEOProps) => {
  const seo = useSEO(props);
  const { i18n } = useTranslation();
  
  return (
    <Helmet>
      {/* Основные мета-теги */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <html lang={seo.lang} />
      
      {/* Robots */}
      {seo.noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={seo.lang === 'ru' ? 'ru_RU' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
      
      {/* Альтернативные языки (если нужно) */}
      <link rel="alternate" hrefLang="ru" href={`${seo.url}?lang=ru`} />
      <link rel="alternate" hrefLang="en" href={`${seo.url}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={seo.url} />
    </Helmet>
  );
};

