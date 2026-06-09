import { CircularProgress } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { StyledGenerateAllButton } from './styled-components';

interface GenerateAllAiSentencesButtonProps {
    onGenerate: () => void;
    isGenerating: boolean;
    disabled?: boolean;
}

export const GenerateAllAiSentencesButton = ({ 
    onGenerate, 
    isGenerating, 
    disabled 
}: GenerateAllAiSentencesButtonProps) => {
    return (
        <StyledGenerateAllButton
            variant="text"
            size="small"
            onClick={onGenerate}
            disabled={disabled || isGenerating}
        >
            {isGenerating
                ? (<CircularProgress size={16} />)
                : (<ReplayIcon fontSize="small" />)
            }
        </StyledGenerateAllButton>
    );
};

