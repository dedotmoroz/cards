import { forwardRef } from 'react';
import { Box } from '@mui/material';
import { CardBox } from './card-box.tsx'

interface CardFlipProps {
    question: string;
    answer: string;
    showAnswer: boolean;
    onClick?: () => void;
    className?: string;
    onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onMouseMove?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onMouseUp?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;
    onTouchMove?: (event: React.TouchEvent<HTMLDivElement>) => void;
    onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;
    onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave?: (event: React.PointerEvent<HTMLDivElement>) => void;
}

export const CardFlip = forwardRef<HTMLDivElement, CardFlipProps>(
  ({
       question,
       answer,
       showAnswer,
       onClick,
       className,
       onMouseDown,
       onMouseMove,
       onMouseUp,
       onMouseLeave,
       onTouchStart,
       onTouchMove,
       onTouchEnd,
       onPointerDown,
       onPointerMove,
       onPointerUp,
       onPointerLeave,
  }, ref) => {

      console.log('showAnswer === ', showAnswer);

      return (
          <Box
              sx={{
                  position: 'relative',
                  height: 400,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  perspective: '1000px'
              }}

              onClick={onClick}
              className={className}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
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
                      inset: 0,
                      transformStyle: 'preserve-3d',
                      transition: 'transform 600ms ease',
                      transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      willChange: 'transform',
                  }}

              >
                          <CardBox>
                              {showAnswer ? question : answer}
                          </CardBox>
              </Box>
          </Box>
      );
  }
);
