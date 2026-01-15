import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Done as SaveIcon, Close as DeleteIcon } from '@mui/icons-material';
import {
    StyledListItem,
    StyledCardContainer,
    StyledCardContent,
    StyledCardColumn,
    StyledCardActions,
    StyledBoxAnswer,
    StyledBoxQuestion,
    StyledInput,
    StyledSaveIconButton,
    StyledCloseIconButton,
} from './styled-components.ts';

interface CreateCardFormProps {
    displayFilter: 'A' | 'AB' | 'B';
    folderId: string;
    onSave: (question: string, answer: string) => Promise<void>;
    onCancel: () => void;
    onAutoSave?: (folderId: string, question: string, answer: string) => Promise<void>;
}

export const CreateCardForm: React.FC<CreateCardFormProps> = ({
    displayFilter,
    folderId,
    onSave,
    onCancel,
    onAutoSave,
}) => {
    const { t } = useTranslation();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [previousFolderId, setPreviousFolderId] = useState(folderId);

    // Автосохранение при смене папки, если данные валидны
    useEffect(() => {
        if (previousFolderId !== folderId && previousFolderId) {
            const trimmedQuestion = question.trim();
            const trimmedAnswer = answer.trim();
            
            if (trimmedQuestion && trimmedAnswer && onAutoSave) {
                // Данные валидны - автосохранение в предыдущую папку
                onAutoSave(previousFolderId, trimmedQuestion, trimmedAnswer).catch(console.error);
            }
            // Если данные невалидны - просто очищаем форму
            setQuestion('');
            setAnswer('');
        }
        setPreviousFolderId(folderId);
    }, [folderId, previousFolderId, question, answer, onAutoSave]);

    const handleSave = async () => {
        const trimmedQuestion = question.trim();
        const trimmedAnswer = answer.trim();
        
        if (!trimmedQuestion || !trimmedAnswer) {
            return; // Не сохраняем, если поля не заполнены
        }

        setIsSaving(true);
        try {
            await onSave(trimmedQuestion, trimmedAnswer);
            setQuestion('');
            setAnswer('');
        } catch (error) {
            console.error('Error saving card:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setQuestion('');
        setAnswer('');
        onCancel();
    };

    const isFormValid = question.trim() && answer.trim();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                // Ctrl/Cmd+Enter - всегда сохраняет
                e.preventDefault();
                if (isFormValid && !isSaving) {
                    handleSave();
                }
            } else if (isFormValid && !isSaving) {
                // Просто Enter - сохраняет только если все поля заполнены
                e.preventDefault();
                handleSave();
            }
        }
    };

    return (
        <StyledListItem>
            <StyledCardContainer>
                <StyledCardContent>
                    <StyledCardColumn
                        $isVisible={displayFilter === 'A' || displayFilter === 'AB'}
                    >
                        <StyledBoxQuestion>
                            <StyledInput
                                type="text"
                                placeholder={t('forms.question')}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </StyledBoxQuestion>
                    </StyledCardColumn>
                    <StyledCardColumn
                        $isVisible={displayFilter === 'B' || displayFilter === 'AB'}
                    >
                        <StyledBoxAnswer>
                            <StyledInput
                                type="text"
                                placeholder={t('forms.answer')}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </StyledBoxAnswer>
                    </StyledCardColumn>
                </StyledCardContent>
                <StyledCardActions>
                    <StyledSaveIconButton
                        onClick={handleSave}
                        disabled={!isFormValid || isSaving}
                        color="primary"
                        size="small"
                    >
                        <SaveIcon />
                    </StyledSaveIconButton>
                    <StyledCloseIconButton
                        onClick={handleCancel}
                        disabled={isSaving}
                        color="error"
                        size="small"
                    >
                        <DeleteIcon />
                    </StyledCloseIconButton>
                </StyledCardActions>
            </StyledCardContainer>
        </StyledListItem>
    );
};
