import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CardGenerationState } from '@/shared/store/cardsStore';
import {
    StyledGenerateButton,
    StyledAutoAwesomeIcon,
    StyledCircularProgress
} from './styled-components';

// import ReplayIcon from '@mui/icons-material/Replay';
// import AutoModeIcon from '@mui/icons-material/AutoMode';

interface GenerateAiSentencesButtonProps {
    cardId: string;
    generationStatus?: CardGenerationState;
    onGenerate: (cardId: string) => void;
}

export const GenerateAiSentencesButton = ({ cardId, generationStatus, onGenerate }: GenerateAiSentencesButtonProps) => {
    const { t } = useTranslation();
    const state = generationStatus ?? { status: 'idle', progress: 0 };
    const isGenerating = state.status === 'pending' || state.status === 'polling';
    const label = t('cards.generateSentences', 'Create content for word');

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onGenerate(cardId);
    };

    return (
        <Tooltip title={label} enterDelay={500} enterNextDelay={500}>
            <span>
                <StyledGenerateButton
                    variant="text"
                    size="small"
                    onClick={handleClick}
                    disabled={isGenerating}
                    aria-label={label}
                >
                    {isGenerating
                        ? (<StyledCircularProgress size={16} />)
                        : (<StyledAutoAwesomeIcon fontSize="small" />)
                    }
                </StyledGenerateButton>
            </span>
        </Tooltip>
    );
};

