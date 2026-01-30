import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAuthStore } from '@/shared/store/authStore';
import { useSEO } from '@/shared/hooks/useSEO';
import {
    ProfileSection,
    LanguageSection,
    PasswordSection,
    TokenSection,
    GuestRegistrationForm,
    StyledProfileWrapper,
    StyledProfileContainer,
    StyledFormPaper,
    StyledHeaderBox,
    StyledHeaderIcon,
} from '@/widgets/user';


import {
    ProfileHeader,
} from '@/entities/user';

export const ProfilePage = () => {
    const { t, i18n } = useTranslation();
    const { user, updateProfile, changePassword, updateLanguage } = useAuthStore();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useSEO({
        title: t('seo.profile.title'),
        description: t('seo.profile.description'),
        keywords: t('seo.keywords'),
        lang: i18n.language
    });

    const initialUsername = useMemo(() => user?.username ?? '', [user?.username]);
    const initialLanguage = useMemo(() => user?.language ?? i18n.language ?? 'ru', [user?.language, i18n.language]);

    const handleProfileSubmit = async (username: string) => {
        await updateProfile({ name: username });
    };

    const handleLanguageSubmit = async (language: string) => {
        await updateLanguage(language);
        await i18n.changeLanguage(language);
    };

    const handlePasswordSubmit = async (currentPassword: string, newPassword: string) => {
        await changePassword({ oldPassword: currentPassword, newPassword });
    };

    if (!user) {
        return null;
    }

    // Если пользователь гость, показываем форму регистрации
    if (user.isGuest) {
        return <GuestRegistrationForm />;
    }

    // Обычная форма профиля для зарегистрированных пользователей
    return (
        <StyledProfileWrapper>
            <StyledProfileContainer>
                <ProfileHeader />

                <StyledFormPaper>
                    <StyledHeaderBox>
                        <StyledHeaderIcon />
                        <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold" gutterBottom>
                            {t('profile.title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('profile.subtitle')}
                        </Typography>
                    </StyledHeaderBox>

                    <ProfileSection
                        initialUsername={initialUsername}
                        userEmail={user.email}
                        onSubmit={handleProfileSubmit}
                    />

                    <LanguageSection
                        initialLanguage={initialLanguage}
                        onSubmit={handleLanguageSubmit}
                    />

                    <PasswordSection onSubmit={handlePasswordSubmit} />

                    <TokenSection
                        userId={user.id}
                        isGuest={user.isGuest ?? false}
                    />
                </StyledFormPaper>
            </StyledProfileContainer>
        </StyledProfileWrapper>
    );
};
