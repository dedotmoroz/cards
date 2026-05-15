import { Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import { SetLanguageLevel } from '@/features/set-language-level';
import { CreateContentButton } from '@/features/create-content';
import {
  StyledContainerWrapper,
  StyledHeaderRow,
  StyledPageTitle,
  StyledChipsSection,
  StyledChipsRow,
  StyledPoolWordChip,
  StyledLearnedWordChip,
  StyledChipLabelRow,
  StyledControlsBlock,
  StyledControlsRow,
  StyledChipsLoading,
} from './styled-components';

export type ContextReadingFolderCard = {
  id: string;
  question: string;
  answer: string;
  isLearned: boolean;
};

export type ContextReadingContentStartProps = {
  learnFolderPath?: string;
  folderCards: ContextReadingFolderCard[];
  folderCardsLoading: boolean;
  languageLevel: string;
  onLanguageLevelChange: (level: string) => void;
  onCreateContent: () => void | Promise<void>;
  loading: boolean;
  generating: boolean;
};

export const ContextReadingContentStart = ({
  learnFolderPath,
  folderCards,
  folderCardsLoading,
  languageLevel,
  onLanguageLevelChange,
  onCreateContent,
  loading,
  generating,
}: ContextReadingContentStartProps) => {
  const { t } = useTranslation();

  const chipLabel = (card: ContextReadingFolderCard) => (
    <StyledChipLabelRow component="span">
      <Typography variant="body2" component="span" fontWeight="medium">
        {card.question}
      </Typography>
      <Typography variant="body2" component="span">
        ({card.answer})
      </Typography>
    </StyledChipLabelRow>
  );

  return (
    <StyledContainerWrapper maxWidth="md">
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}
      <StyledHeaderRow>
        <StyledPageTitle variant="h4">
          {t('contextReading.title', { defaultValue: 'Context' })}
        </StyledPageTitle>
      </StyledHeaderRow>

      {folderCardsLoading ? (
        <StyledChipsLoading>
          <CircularProgress size={28} />
        </StyledChipsLoading>
      ) : (
        folderCards.length > 0 && (
          <StyledChipsSection>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('contextReading.words', { defaultValue: 'Words from content' })}
            </Typography>
            <StyledChipsRow>
              {folderCards.map(card => {
                const ChipComponent = card.isLearned ? StyledLearnedWordChip : StyledPoolWordChip;
                return (
                  <ChipComponent
                    key={card.id}
                    size="small"
                    variant="outlined"
                    label={chipLabel(card)}
                  />
                );
              })}
            </StyledChipsRow>
          </StyledChipsSection>
        )
      )}

      <StyledControlsBlock>
        <StyledControlsRow>
          <SetLanguageLevel
            value={languageLevel}
            onChange={onLanguageLevelChange}
            disabled={loading || generating}
          />
          <CreateContentButton onClick={onCreateContent} disabled={loading || generating} sx={{ minWidth: 220 }} />
        </StyledControlsRow>
      </StyledControlsBlock>
    </StyledContainerWrapper>
  );
};
