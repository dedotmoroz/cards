import { Typography, Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import {
    StyledHeaderRow,
    StyledPageTitle,
    StyledContainerWrapper,
} from "./styled-components.ts";

export type ContextReadingContextLoadingProps = {
  learnFolderPath?: string;
};

export const ContextReadingContextLoading = ({ learnFolderPath }: ContextReadingContextLoadingProps) => {
  const { t } = useTranslation();

  return (
      <StyledContainerWrapper maxWidth="md">
          {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}

        <StyledHeaderRow>
            <StyledPageTitle>
                {t('contextReading.title', { defaultValue: 'Context' })}
            </StyledPageTitle>
        </StyledHeaderRow>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 'calc(100dvh - 200px)',
          px: 2,
          pb: 4,
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">
          {t('contextReading.generating')}
        </Typography>
      </Box>
    </StyledContainerWrapper>
  );
};
