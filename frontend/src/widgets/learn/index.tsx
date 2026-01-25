import React, {useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import { CardFlip } from "./card-flip/card-flip";
import {LearningControls} from "@/features/card-learning/ui/learning-controls.tsx";
import {LearningNavigation} from "@/features/card-learning/ui/learning-navigation.tsx";
import {CompletionScreen} from "@/widgets/learn/learning-completion/ui/completion-screen.tsx";
import {useNavigate} from "react-router-dom";
import { useFoldersStore } from '@/shared/store/foldersStore';
import type { Card } from "@/shared/types/cards";

interface LearningHook {
  // State
  cards: Card[];
  displayCards: Card[];
  currentCard: Card | undefined;
  currentIndex: number;
  showAnswer: boolean;
  showOnlyUnlearned: boolean;
  phrasesMode: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  learnedCount: number;
  unlearnedCount: number;
  initialDisplayCardsCount: number;
  initialSide: 'question' | 'answer';
  
  // Actions
  toggleAnswer: () => void;
  handleKnow: () => Promise<void>;
  handleDontKnow: () => Promise<void>;
  navigateToCard: (index: number) => void;
  setLearningMode: (unlearnedOnly: boolean) => void;
  setPhrasesMode: (enabled: boolean) => void;
  setInitialSide: (side: 'question' | 'answer') => void;
}

interface LearnProcessProps {
  learning: LearningHook;
}

export const LearnProcess: React.FC<LearnProcessProps> = ({ learning }) => {
    const navigate = useNavigate();
    const { userId, folderId } = useParams<{ userId?: string; folderId?: string }>();
    const { selectedFolderId } = useFoldersStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { showAnswer, currentCard, toggleAnswer, handleKnow, handleDontKnow } = learning;

    // Используем folderId из URL, если он есть, иначе используем selectedFolderId из store
    const currentFolderId = folderId || selectedFolderId;

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowRight':
                    event.preventDefault();
                    learning.handleKnow();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    learning.handleDontKnow();
                    break;
                case 'Space':
                    event.preventDefault();
                    toggleAnswer();
                    break;
                case 'Escape':
                    event.preventDefault();
                    if (userId && currentFolderId) {
                        navigate(`/learn/${userId}/${currentFolderId}`);
                    } else if (currentFolderId) {
                        navigate(`/learn/${currentFolderId}`);
                    } else {
                        navigate('/learn');
                    }
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [learning, navigate, userId, currentFolderId, toggleAnswer]);


    // Navigation handlers
    const handleBackToFolders = () => {
        if (userId && currentFolderId) {
            navigate(`/learn/${userId}/${currentFolderId}`);
        } else if (currentFolderId) {
            navigate(`/learn/${currentFolderId}`);
        } else {
            navigate('/learn');
        }
    };
    const handleContinueLearning = () => learning.setLearningMode(true);
    const handlePrevious = () => learning.navigateToCard(learning.currentIndex - 1);
    const handleNext = () => learning.navigateToCard(learning.currentIndex + 1);


    return (
        <>
            {/* Card or completion screen */}
            {learning.isCompleted ? (
                <CompletionScreen
                    onBackToFolders={handleBackToFolders}
                    onContinueLearning={handleContinueLearning}
                    hasUnlearnedCards={learning.cards.some(card => !card.isLearned)}
                    learnedCount={learning.cards.filter(card => card.isLearned).length}
                    unlearnedCount={learning.cards.filter(card => !card.isLearned).length}
                />
            ) : (<>
                {/* Navigation */}
                <LearningNavigation
                    currentIndex={learning.currentIndex}
                    totalCards={learning.initialDisplayCardsCount}
                    isCompleted={learning.isCompleted}
                    isFirst={learning.currentIndex === 0}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    initialSide={learning.initialSide}
                    onSideChange={learning.setInitialSide}
                    currentText={
                        learning.initialSide === 'question'
                            ? (learning.phrasesMode ? currentCard?.questionSentences : currentCard?.question)
                            : (learning.phrasesMode ? currentCard?.answerSentences : currentCard?.answer)
                    }
                />
                    <CardFlip
                        question={learning.phrasesMode ? currentCard?.questionSentences : currentCard?.question}
                        answer={learning.phrasesMode ? currentCard?.answerSentences : currentCard?.answer}
                        showAnswer={showAnswer}
                        toggleAnswer={toggleAnswer}
                        handleKnow={handleKnow}
                        handleDontKnow={handleDontKnow}
                        phrasesMode={learning.phrasesMode}
                        currentCard={currentCard}
                        onTogglePhrasesMode={() => learning.setPhrasesMode(!learning.phrasesMode)}
                    />
                    {/* Controls - только для десктопа */}
                    {!isMobile && (
                        <LearningControls
                            onKnow={learning.handleKnow}
                            onDontKnow={learning.handleDontKnow}
                            learnedCount={learning.learnedCount || 0}
                            unlearnedCount={learning.unlearnedCount || 0}
                        />
                    )}
                </>)
            }
        </>
    );
};
