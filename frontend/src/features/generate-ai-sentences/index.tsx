import { CircularProgress } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import type { CardGenerationState } from '@/shared/store/cardsStore';
import { StyledGenerateButton } from './styled-components';

interface GenerateAiSentencesButtonProps {
    cardId: string;
    generationStatus?: CardGenerationState;
    onGenerate: (cardId: string) => void;
}

export const GenerateAiSentencesButton = ({ cardId, generationStatus, onGenerate }: GenerateAiSentencesButtonProps) => {
    const state = generationStatus ?? { status: 'idle', progress: 0 };
    const isGenerating = state.status === 'pending' || state.status === 'polling';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onGenerate(cardId);
    };

    return (
        <StyledGenerateButton
            variant="text"
            size="small"
            onClick={handleClick}
            disabled={isGenerating}
        >
            {isGenerating
                ? (<CircularProgress size={16} />)
                : (<ReplayIcon fontSize="small" />)
            }
        </StyledGenerateButton>
    );
};

