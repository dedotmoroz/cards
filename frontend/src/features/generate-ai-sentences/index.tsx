import { useState } from 'react';
import { Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CardGenerationRequest } from '@/shared/types/cards';
import { MAX_CARD_CONTEXTS } from '@/shared/types/cards';
import type { CardGenerationState } from '@/shared/store/cardsStore';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import {
    StyledGenerateButton,
    StyledAutoAwesomeIcon,
    StyledCircularProgress
} from './styled-components';

interface GenerateAiSentencesButtonProps {
    cardId: string;
    contextCount?: number;
    generationStatus?: CardGenerationState;
    onGenerate: (cardId: string, options?: CardGenerationRequest) => void;
}

export const GenerateAiSentencesButton = ({
    cardId,
    contextCount = 0,
    generationStatus,
    onGenerate,
}: GenerateAiSentencesButtonProps) => {
    const { t } = useTranslation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const state = generationStatus ?? { status: 'idle', progress: 0 };
    const isGenerating = state.status === 'pending' || state.status === 'polling';
    const label = t('cards.generateSentences', 'Create content for word');

    const startGenerate = (replaceOldest?: boolean) => {
        onGenerate(cardId, replaceOldest ? { replaceOldest: true } : undefined);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (contextCount >= MAX_CARD_CONTEXTS) {
            setConfirmOpen(true);
            return;
        }
        startGenerate();
    };

    const handleClose = () => setConfirmOpen(false);

    return (
        <>
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
            <DialogUI
                open={confirmOpen}
                onClose={handleClose}
                onClick={(e) => e.stopPropagation()}
                title={t('cards.replaceOldestContextTitle', 'Replace oldest context?')}
                fullWidth
                maxWidth="sm"
                content={
                    <Typography color="text.secondary">
                        {t(
                            'cards.replaceOldestContextBody',
                            'This word already has {{max}} saved contexts. Generate a new one and replace the oldest?',
                            { max: MAX_CARD_CONTEXTS },
                        )}
                    </Typography>
                }
                actions={
                    <>
                        <ButtonUI onClick={handleClose}>
                            {t('auth.cancel')}
                        </ButtonUI>
                        <ButtonUI
                            variant="contained"
                            onClick={() => {
                                handleClose();
                                startGenerate(true);
                            }}
                        >
                            {t('cards.replaceOldestContextConfirm', 'Replace')}
                        </ButtonUI>
                    </>
                }
            />
        </>
    );
};
