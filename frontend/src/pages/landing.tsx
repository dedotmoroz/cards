import { useTranslation } from 'react-i18next';
import {
  Box,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { useSEO } from '@/shared/hooks/useSEO';

import { FeaturesBox} from "@/widgets/landing/features-box.tsx";
import { WhiteBlock } from "@/widgets/landing/white-block.tsx"
import {RedBox} from "@/widgets/landing/red-box.tsx";
import { ExampleCard } from "@/widgets/landing/example-card"
import {Headline} from "@/widgets/landing/headline.tsx";
import {UserBlock} from "@/widgets/landing/user-block.tsx";

import {
    StyledLandingContainer,
    StyledHeadlineContainer,
} from './styled-components.ts'


export const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, createGuest } = useAuthStore();

  useSEO({
    title: t('seo.landing.title'),
    description: t('seo.landing.description'),
    keywords: t('seo.keywords'),
    lang: i18n.language
  });

  const handleStartLearning = async () => {
    if (isAuthenticated) {
      navigate('/learn');
    } else {
      try {
        const language = i18n.language || 'ru';
        await createGuest(language);
        navigate('/learn');
      } catch (error) {
        console.error('Failed to create guest:', error);
      }
    }
  };

  return (
      <>
          <UserBlock/>
          <StyledLandingContainer>
              {/* First Screen - Main Content with Example Card */}
              <StyledHeadlineContainer maxWidth="lg">
                  <Box
                      sx={{
                          display: 'grid',
                          gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'},
                          gap: 4,
                          alignItems: 'top',
                      }}
                  >
                      <Box>
                          <Headline handleStartLearning={handleStartLearning}/>
                      </Box>
                      <Box>
                          <ExampleCard/>
                      </Box>
                  </Box>
              </StyledHeadlineContainer>

              {/* Context Info Card Section */}
              <StyledHeadlineContainer maxWidth="lg">
                  <WhiteBlock/>
              </StyledHeadlineContainer>

              {/* Features Grid Section */}
              <StyledHeadlineContainer maxWidth="lg" id="features-section">
                  <Box
                      sx={{
                          display: 'grid',
                          gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'},
                          gap: 4,
                      }}
                  >
                      <FeaturesBox/>
                  </Box>
              </StyledHeadlineContainer>

              {/* Main Hero Section - Gradient Card */}
              <StyledHeadlineContainer maxWidth="lg">
                  <RedBox handleStartLearning={handleStartLearning}/>
              </StyledHeadlineContainer>

          </StyledLandingContainer>
      </>
  );
};
