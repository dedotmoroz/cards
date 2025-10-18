import React from 'react';
import { useCardSwipe } from "@/features/card-swipe/model/useCardSwipe";
import { CardFlip } from "./card-flip/card-flip";
import {LearningControls} from "@/features/card-learning/ui/learning-controls.tsx";
import {Box, Typography} from "@mui/material";
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
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  toggleAnswer: () => void;
  handleKnow: () => Promise<void>;
  handleDontKnow: () => Promise<void>;
  navigateToCard: (index: number) => void;
  setLearningMode: (unlearnedOnly: boolean) => void;
}

interface LearnProcessProps {
  learning: LearningHook;
}

export const LearnProcess: React.FC<LearnProcessProps> = ({ learning }) => {
    const swipe = useCardSwipe();
    const navigate = useNavigate();

    const handleSwipeAction = (action: string) => {
        switch (action) {
            case 'know':
                swipe.animateSwipe('right');
                setTimeout(() => {
                    learning.handleKnow();
                    swipe.resetCard();
                }, 500);
                break;
            case 'dontKnow':
                swipe.animateSwipe('left');
                setTimeout(() => {
                    learning.handleDontKnow();
                    swipe.resetCard();
                }, 500);
                break;
        }
    };

    const handleMouseUp = () => {
        const result = swipe.handleMouseUp();
        if (result) {
            console.log('Mouse swipe result:', result);
            handleSwipeAction(result.action);
        }
    };

    // const handleTouchEnd = () => {
    //     const result = swipe.handleTouchEnd();
    //     if (result) {
    //         console.log('Touch swipe result:', result);
    //         handleSwipeAction(result.action);
    //     }
    // };

    // Navigation handlers
    const handleBackToFolders = () => navigate('/');
    const handleContinueLearning = () => learning.setLearningMode(true);
    const handlePrevious = () => learning.navigateToCard(learning.currentIndex - 1);
    const handleNext = () => learning.navigateToCard(learning.currentIndex + 1);


    const start = React.useRef<{x:number; y:number; t:number}>({x:0,y:0,t:0});
    const dragging = React.useRef(false);
    const THRESHOLD_PX = 6;     // допуск на «клик»
    const THRESHOLD_MS = 250;   // кликовая длительность

    const onPointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
        dragging.current = false;
        // твоя логика начала свайпа:
        swipe.handleMouseDown?.(e as any);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const dx = Math.abs(e.clientX - start.current.x);
        const dy = Math.abs(e.clientY - start.current.y);
        if (dx > THRESHOLD_PX || dy > THRESHOLD_PX) dragging.current = true;
        // твоя логика перемещения:
        swipe.handleMouseMove?.(e as any);
    };

    const onPointerUp = (e: React.PointerEvent) => {
        const dx = Math.abs(e.clientX - start.current.x);
        const dy = Math.abs(e.clientY - start.current.y);
        const dt = performance.now() - start.current.t;
        const wasDrag = dragging.current || dx > THRESHOLD_PX || dy > THRESHOLD_PX || dt > THRESHOLD_MS;

        // завершаем свайп:
        handleMouseUp?.(e as any);

        if (wasDrag) {
            console.log('---- это был свайп');
            // это был свайп — блокируем клик, который браузер сгенерирует после mouseup
            e.preventDefault();
            e.stopPropagation();
        } else {
            // это клик — вызываем показ ответа вручную
            console.log('+++ это клик');
            learning.toggleAnswer();
        }

        dragging.current = false;
    };

    const onPointerLeave = (e: React.PointerEvent) => {
        // если ушли за пределы — завершаем свайп и гасим клик
        if (dragging.current) {
            e.preventDefault();
            e.stopPropagation();
        }
        handleMouseUp?.(e as any);
        dragging.current = false;
    };

    return (
        <>
            {/* Navigation */}
            <LearningNavigation
                currentIndex={learning.currentIndex}
                totalCards={learning.displayCards.length}
                isCompleted={learning.isCompleted}
                isFirst={learning.currentIndex === 0}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onBack={handleBackToFolders}
                // disabled={swipe.isAnimating}
            />

            {/* Card or completion screen */}
            {learning.isCompleted ? (
                <CompletionScreen
                    onBackToFolders={handleBackToFolders}
                    onContinueLearning={handleContinueLearning}
                    hasUnlearnedCards={learning.cards.some(card => !card.isLearned)}
                />
            ) : learning.currentCard ? (<>
                    <CardFlip
                        ref={swipe.cardRef}
                        question={learning.currentCard.question}
                        answer={learning.currentCard.answer}
                        showAnswer={learning.showAnswer}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerLeave}
                    />
                    {/* Controls */}
                    <LearningControls
                        onKnow={learning.handleKnow}
                        onDontKnow={learning.handleDontKnow}
                        onFlip={learning.toggleAnswer}
                        // disabled={swipe.isAnimating}
                    />
                    {/* Help text */}
                    {/*<Box textAlign="center" mt={3}>*/}
                    {/*    <Typography variant="body2" color="text.secondary">*/}
                    {/*        💡 Управление: ← Не знаю | → Знаю | Пробел - перевернуть | ESC - назад*/}
                    {/*    </Typography>*/}
                    {/*</Box>*/}
                </>
            ) : (
                <Box textAlign="center" mt={4}>
                    <Typography variant="h6" color="text.secondary">
                        Карточка не найдена
                    </Typography>
                </Box>
            )}
        </>
    );
};
