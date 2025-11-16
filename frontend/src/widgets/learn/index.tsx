import React, {useEffect} from 'react';
import { CardFlip } from "./card-flip/card-flip";
import {LearningControls} from "@/features/card-learning/ui/learning-controls.tsx";
import {LearningNavigation} from "@/features/card-learning/ui/learning-navigation.tsx";
import {CompletionScreen} from "@/features/learning-completion/ui/completion-screen.tsx";
import {useNavigate} from "react-router-dom";
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

    const { showAnswer, currentCard, toggleAnswer, handleKnow, handleDontKnow } = learning;

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
                    navigate('/learn');
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [learning, navigate]);


    // Navigation handlers
    const handleBackToFolders = () => navigate('/learn');
    const handleContinueLearning = () => learning.setLearningMode(true);
    const handlePrevious = () => learning.navigateToCard(learning.currentIndex - 1);
    const handleNext = () => learning.navigateToCard(learning.currentIndex + 1);


    return (
        <>
            {/* Navigation */}
            <LearningNavigation
                currentIndex={learning.currentIndex}
                totalCards={learning.initialDisplayCardsCount}
                isCompleted={learning.isCompleted}
                isFirst={learning.currentIndex === 0}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onBack={handleBackToFolders}
            />

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
                    <CardFlip
                        question={learning.phrasesMode ? currentCard?.questionSentences : currentCard?.question}
                        answer={learning.phrasesMode ? currentCard?.answerSentences : currentCard?.answer}
                        showAnswer={showAnswer}
                        toggleAnswer={toggleAnswer}
                        handleKnow={handleKnow}
                        handleDontKnow={handleDontKnow}
                    />
                    {/* Controls */}
                    <LearningControls
                        onKnow={learning.handleKnow}
                        onDontKnow={learning.handleDontKnow}
                        learnedCount={learning.learnedCount || 0}
                        unlearnedCount={learning.unlearnedCount || 0}
                    />
                </>)
            }
        </>
    );
};
