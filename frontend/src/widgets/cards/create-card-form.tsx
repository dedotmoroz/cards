import React, { useState, useEffect, useRef } from 'react';
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
    StyledSuggestionsBox,
    StyledSuggestionsList,
    StyledSuggestionItem,
    StyledLoadingIndicator,
} from './styled-components.ts';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { translateApi } from '@/shared/api/translateApi';
import { useAuthStore } from '@/shared/store/authStore';

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
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [previousFolderId, setPreviousFolderId] = useState(folderId);
    const [translationSuggestion, setTranslationSuggestion] = useState<string | null>(null);
    const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const answerInputRef = useRef<HTMLInputElement>(null);

    // Debounce для question, чтобы не делать запрос при каждом изменении
    const debouncedQuestion = useDebounce(question, 800);

    // Автоперевод при изменении question
    useEffect(() => {
        const trimmedQuestion = debouncedQuestion.trim();
        
        // Не переводим, если:
        // - question пустой
        // - answer уже заполнен (пользователь сам ввел)
        // - идет сохранение
        if (!trimmedQuestion || answer.trim() || isSaving) {
            setTranslationSuggestion(null);
            setShowSuggestions(false);
            setIsLoadingTranslation(false);
            return;
        }

        // Получаем язык интерфейса (приоритет - текущий язык интерфейса из i18n)
        // Если язык интерфейса не установлен, используем язык пользователя из настроек
        const targetLang = i18n.language || user?.language || 'en';
        
        // Если язык английский, не переводим (скорее всего пользователь учит английский)
        // Но можно убрать эту проверку, если нужен перевод даже для английского
        if (targetLang === 'en') {
            setTranslationSuggestion(null);
            setShowSuggestions(false);
            return;
        }

        // Отменяем предыдущий запрос, если он еще выполняется
        let cancelled = false;

        const fetchTranslation = async () => {
            setIsLoadingTranslation(true);
            setShowSuggestions(true);
            
            try {
                const result = await translateApi.translate({
                    text: trimmedQuestion,
                    targetLang: targetLang,
                });
                
                // Проверяем, не был ли запрос отменен
                if (!cancelled) {
                    setTranslationSuggestion(result.translatedText);
                }
            } catch (error) {
                console.error('Translation error:', error);
                if (!cancelled) {
                    setTranslationSuggestion(null);
                    setShowSuggestions(false);
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingTranslation(false);
                }
            }
        };

        fetchTranslation();

        // Функция очистки при размонтировании или изменении зависимостей
        return () => {
            cancelled = true;
        };
    }, [debouncedQuestion, answer, isSaving, user?.language, i18n.language]);

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
            setTranslationSuggestion(null);
            setShowSuggestions(false);
        }
        setPreviousFolderId(folderId);
    }, [folderId, previousFolderId, question, answer, onAutoSave]);

    // Закрываем подсказки при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                answerInputRef.current &&
                !answerInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
            setTranslationSuggestion(null);
            setShowSuggestions(false);
        } catch (error) {
            console.error('Error saving card:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setQuestion('');
        setAnswer('');
        setTranslationSuggestion(null);
        setShowSuggestions(false);
        onCancel();
    };

    const handleSuggestionClick = (suggestion: string) => {
        setAnswer(suggestion);
        setShowSuggestions(false);
        // Фокусируемся на поле answer после выбора подсказки
        answerInputRef.current?.focus();
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnswer(e.target.value);
        // Если пользователь начал вводить, скрываем подсказки
        if (e.target.value.trim()) {
            setShowSuggestions(false);
        }
    };

    const handleAnswerFocus = () => {
        // Показываем подсказки при фокусе, если они есть
        if (translationSuggestion && !answer.trim()) {
            setShowSuggestions(true);
        }
    };

    const isFormValid = question.trim() && answer.trim();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Если есть подсказка и пользователь нажал Enter в поле answer, используем подсказку
        if (e.key === 'Enter' && translationSuggestion && !answer.trim() && showSuggestions) {
            const target = e.target as HTMLInputElement;
            if (target === answerInputRef.current) {
                e.preventDefault();
                handleSuggestionClick(translationSuggestion);
                return;
            }
        }

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

        // Стрелка вниз - показать подсказки, если они есть
        if (e.key === 'ArrowDown' && translationSuggestion && !showSuggestions) {
            e.preventDefault();
            setShowSuggestions(true);
        }

        // Escape - скрыть подсказки
        if (e.key === 'Escape' && showSuggestions) {
            e.preventDefault();
            setShowSuggestions(false);
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
                            <StyledSuggestionsBox>
                                <StyledInput
                                    ref={answerInputRef}
                                    type="text"
                                    placeholder={
                                        isLoadingTranslation 
                                            ? t('forms.translating', { defaultValue: 'Перевожу...' })
                                            : t('forms.answer')
                                    }
                                    value={answer}
                                    onChange={handleAnswerChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={handleAnswerFocus}
                                />
                                {showSuggestions && (
                                    <StyledSuggestionsList ref={suggestionsRef}>
                                        {isLoadingTranslation ? (
                                            <StyledLoadingIndicator>
                                                {t('forms.translating', { defaultValue: 'Перевожу...' })}
                                            </StyledLoadingIndicator>
                                        ) : translationSuggestion ? (
                                            <StyledSuggestionItem
                                                onClick={() => handleSuggestionClick(translationSuggestion)}
                                            >
                                                {translationSuggestion}
                                            </StyledSuggestionItem>
                                        ) : null}
                                    </StyledSuggestionsList>
                                )}
                            </StyledSuggestionsBox>
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
