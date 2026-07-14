import { Typography, CircularProgress, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/entities/user';
import { SetLanguageLevel } from '@/features/set-language-level';
import { CreateContentButton } from '@/features/create-content';
import { ButtonUI } from '@/shared/ui/button-ui';
import {
  StyledContainerWrapper,
  StyledHeaderRow,
  StyledPageTitle,
  StyledChipsSection,
  StyledChipsRow,
  StyledPoolWordChip,
  StyledLearnedWordChip,
  StyledUnactiveWordChip,
  StyledChipLabelRow,
  StyledChipLearnedMark,
  StyledControlsBlock,
  StyledControlsRow,
  StyledChipsLoading,
  StyledButtonContainer,
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
  onlyUnlearnedWords: boolean;
  onOnlyUnlearnedWordsChange: (value: boolean) => void;
  languageLevel: string;
  onLanguageLevelChange: (level: string) => void;
  onCreateContent: () => void | Promise<void>;
  hasLatest?: boolean;
  onOpenLatest?: () => void;
  loading: boolean;
  generating: boolean;
};

export const ContextReadingContentStart = ({
  learnFolderPath,
  folderCards,
  folderCardsLoading,
  onlyUnlearnedWords,
  onOnlyUnlearnedWordsChange,
  languageLevel,
  onLanguageLevelChange,
  onCreateContent,
  hasLatest,
  onOpenLatest,
  loading,
  generating,
}: ContextReadingContentStartProps) => {
  const { t } = useTranslation();

  const poolCount = onlyUnlearnedWords
    ? folderCards.filter(card => !card.isLearned).length
    : folderCards.length;

  const getChipComponent = (card: ContextReadingFolderCard) => {
    if (onlyUnlearnedWords && card.isLearned) {
      return StyledUnactiveWordChip;
    }
    if (card.isLearned) {
      return StyledLearnedWordChip;
    }
    return StyledPoolWordChip;
  };

  const chipLabel = (card: ContextReadingFolderCard) => (
    <StyledChipLabelRow component="span">
      <Typography variant="body2" component="span" fontWeight="medium">
        {card.question}
      </Typography>
      <Typography variant="body2" component="span">
        ({card.answer})
      </Typography>
      {card.isLearned && <StyledChipLearnedMark aria-hidden />}
    </StyledChipLabelRow>
  );

  return (
    <StyledContainerWrapper maxWidth="md">
      {learnFolderPath && <ProfileHeader navigateTo={learnFolderPath} />}

      <StyledHeaderRow>
        <StyledPageTitle>
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
              {t('contextReading.words', {
                count: poolCount,
                defaultValue: 'Words for context: {{count}}',
              })}
            </Typography>
            <StyledChipsRow>
              {folderCards.map(card => {
                const ChipComponent = getChipComponent(card);
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
        <FormControlLabel
          control={
            <Checkbox
              checked={onlyUnlearnedWords}
              onChange={(_, checked) => onOnlyUnlearnedWordsChange(checked)}
              disabled={loading || generating}
            />
          }
          label={t('contextReading.onlyUnlearned', { defaultValue: 'Only unlearned words' })}
        />
        <StyledControlsRow>
          <SetLanguageLevel
            value={languageLevel}
            onChange={onLanguageLevelChange}
            disabled={loading || generating}
          />
        </StyledControlsRow>
        <StyledButtonContainer>
          <CreateContentButton
            onClick={onCreateContent}
            disabled={loading || generating}
          />
          {hasLatest && onOpenLatest && (
            <ButtonUI
              onClick={onOpenLatest}
              disabled={loading || generating}
              sx={{ ml: 1 }}
            >
                {t('contextReading.openHistory', { defaultValue: 'Open saved' })}
            </ButtonUI>
          )}
        </StyledButtonContainer>
      </StyledControlsBlock>
    </StyledContainerWrapper>
  );
};
