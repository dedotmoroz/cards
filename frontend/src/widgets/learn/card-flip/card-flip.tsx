import React, {forwardRef, useRef, useState, useEffect} from 'react';
import {Box, IconButton} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import {CardBox} from './card-box.tsx'
import {useCardSwipe} from "@/features/card-swipe/model/useCardSwipe.ts";
import {StyledEmptyCardPlace} from './styled-components';
import {useTranslation} from 'react-i18next';
import type {Card} from '@/shared/types/cards';
import { StyledTipBox } from './styled-components.ts'

interface CardFlipProps {
    question?: string;
    answer?: string;
    showAnswer: boolean;
    toggleAnswer: () => void;
    handleKnow: () => void;
    handleDontKnow: () => void;
    phrasesMode?: boolean;
    currentCard?: Card;
    onTogglePhrasesMode?: () => void;
}

export const CardFlip = forwardRef<HTMLDivElement, CardFlipProps>(
  ({
       question,
       answer,
       showAnswer,
       toggleAnswer,
       handleKnow,
       handleDontKnow,
       phrasesMode = false,
       currentCard,
       onTogglePhrasesMode,
  }, ref) => {
      const { t } = useTranslation();
      const [showAlternateContent, setShowAlternateContent] = useState(false);
      
      // Сбрасываем состояние при изменении карточки или переключении стороны
      useEffect(() => {
          setShowAlternateContent(false);
      }, [currentCard?.id, showAnswer]);
      const start = useRef<{x:number; y:number; t:number}>({x:0,y:0,t:0});
      const dragging = useRef(false);
      const THRESHOLD_PX = 6;     // допуск на «клик»
      const THRESHOLD_MS = 250;   // кликовая длительность

      const swipe = useCardSwipe();


      const onPointerDown = (e: React.PointerEvent) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
          dragging.current = false;
          // Создаем MouseEvent из PointerEvent для совместимости с swipe логикой
          const mouseEvent = {
              ...e,
              clientX: e.clientX,
              clientY: e.clientY,
              preventDefault: e.preventDefault,
              stopPropagation: e.stopPropagation,
          } as React.MouseEvent;
          swipe.handleMouseDown(mouseEvent);
      };

      const onPointerMove = (e: React.PointerEvent) => {
          const dx = Math.abs(e.clientX - start.current.x);
          const dy = Math.abs(e.clientY - start.current.y);
          if (dx > THRESHOLD_PX || dy > THRESHOLD_PX) dragging.current = true;
          // Создаем MouseEvent из PointerEvent для совместимости с swipe логикой
          const mouseEvent = {
              ...e,
              clientX: e.clientX,
              clientY: e.clientY,
              preventDefault: e.preventDefault,
              stopPropagation: e.stopPropagation,
          } as React.MouseEvent;
          swipe.handleMouseMove(mouseEvent);
      };

      const onPointerUp = (e: React.PointerEvent) => {
          const dx = Math.abs(e.clientX - start.current.x);
          const dy = Math.abs(e.clientY - start.current.y);
          const dt = performance.now() - start.current.t;
          const wasDrag = dragging.current || dx > THRESHOLD_PX || dy > THRESHOLD_PX || dt > THRESHOLD_MS;

          // Завершаем свайп
          const result = swipe.handleMouseUp();
          if (result) {
              console.log('Mouse swipe result:', result);
              handleSwipeAction(result.action);
          }

          if (wasDrag) {
              console.log('---- это был свайп');
              // это был свайп — блокируем клик, который браузер сгенерирует после mouseup
              e.preventDefault();
              e.stopPropagation();
          } else {
              // это клик — вызываем показ ответа вручную
              console.log('+++ это клик');
              toggleAnswer();
          }

          dragging.current = false;
      };

      const handleSwipeAction = (action: string) => {
          switch (action) {
              case 'know':
                  swipe.animateSwipe('right');
                  handleKnow();
                  setTimeout(() => {
                      swipe.resetCard();
                  }, 500);
                  break;
              case 'dontKnow':
                  swipe.animateSwipe('left');
                  handleDontKnow();
                  setTimeout(() => {
                      swipe.resetCard();
                  }, 500);
                  break;
          }
      };

      const onPointerLeave = (e: React.PointerEvent) => {
          // если ушли за пределы — завершаем свайп и гасим клик
          if (dragging.current) {
              e.preventDefault();
              e.stopPropagation();
          }
          const result = swipe.handleMouseUp();
          if (result) {
              console.log('Mouse swipe result:', result);
              handleSwipeAction(result.action);
          }
          dragging.current = false;
      };

        return (
            <Box
                sx={{
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 30,
                        height: 400,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    ref={swipe.cardRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerLeave}
                >
                    <Box
                        ref={ref}
                        sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 500,
                            height: 300,
                            cursor: 'pointer',
                        }}

                    >
                        <CardBox>
                            {/* 
                              ЛОГИКА: showAnswer ? question : answer
                              - showAnswer = true → показывается question
                              - showAnswer = false → показывается answer
                              Если initialSide = 'answer', то showAnswer должно быть false
                            */}
                            {showAnswer ? question : answer}
                        </CardBox>
                    </Box>
                </Box>
            <Box
                sx={{
                    position: 'absolute',
                    top:0,
                    zIndex: 20,
                    height: 400,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <StyledEmptyCardPlace />
            </Box>
            {/* Кнопка показа контекста/слова */}
            {((phrasesMode && currentCard?.question && currentCard?.answer) || 
              (!phrasesMode && currentCard?.questionSentences && currentCard?.answerSentences)) && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 2,
                    }}
                >
                    {!showAlternateContent ? (
                        <Box
                            onClick={() => setShowAlternateContent(true)}
                            sx={{
                                minHeight: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            {onTogglePhrasesMode && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePhrasesMode();
                                    }}
                                    aria-label={t('cards.switchMode', 'Переключить режим')}
                                >
                                    <SwapVertIcon />
                                </IconButton>
                            )}
                            {phrasesMode 
                                ? t('cards.showWord', 'Показать слово')
                                : t('cards.showContext', 'Показать контекст')
                            }
                        </Box>
                    ) : (
                        <StyledTipBox>
                            {phrasesMode ? (
                                <Box onClick={() => setShowAlternateContent(false)}>
                                    {showAnswer ? currentCard?.question : currentCard?.answer}
                                </Box>
                            ) : (
                                <Box onClick={() => setShowAlternateContent(false)}>
                                    {showAnswer ? currentCard?.questionSentences : currentCard?.answerSentences}
                                </Box>
                            )}
                        </StyledTipBox>
                    )}
                </Box>
            )}
            </Box>
        );
    }
);
