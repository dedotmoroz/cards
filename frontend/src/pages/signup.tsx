import { useTranslation } from 'react-i18next';
import { useSEO } from '@/shared/hooks/useSEO';
import { SignUpForm } from '@/widgets/sign-up';

export const SignUpPage = () => {
  const { t, i18n } = useTranslation();

  useSEO({
    title: t('seo.signup.title'),
    description: t('seo.signup.description'),
    keywords: t('seo.keywords'),
    lang: i18n.language,
    noindex: true,
  });

  return <SignUpForm />;
};
