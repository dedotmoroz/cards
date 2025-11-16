import React, {forwardRef, useRef} from 'react';
import {Box, Card} from '@mui/material';
import {CardBox} from './card-box.tsx'
import {useCardSwipe} from "@/features/card-swipe/model/useCardSwipe.ts";

interface CardFlipProps {
    question?: string;
    answer?: string;
    showAnswer: boolean;
    toggleAnswer: () => void;
    handleKnow: () => void;
    handleDontKnow: () => void;
}

export const CardFlip = forwardRef<HTMLDivElement, CardFlipProps>(
  ({
       question,
       answer,
       showAnswer,
       toggleAnswer,
       handleKnow,
       handleDontKnow,
  }, ref) => {
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
                <Card
                    sx={{
                        height: 300,
                        width: 500,
                        boxShadow: 0,
                        borderRadius: '20px',
                        backgroundColor: '#ececec',
                    }}
                />
            </Box>
            </Box>
        );
    }
);
