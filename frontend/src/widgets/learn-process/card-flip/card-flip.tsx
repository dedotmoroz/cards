import { forwardRef } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

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
    onTouchEnd
  }, ref) => {
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
        >
      <Box
        ref={ref}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 500,
          height: 300,
          cursor: 'pointer',
          userSelect: 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease-in-out',
          transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
          '&:hover': {
            boxShadow: 3
          }
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
      >
        {/* Передняя сторона карточки (вопрос) */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CardContent sx={{ width: '100%', textAlign: 'center', p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {question}
            </Typography>
          </CardContent>
        </Card>

        {/* Задняя сторона карточки (ответ) */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CardContent sx={{ width: '100%', textAlign: 'center', p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {answer}
            </Typography>
          </CardContent>
        </Card>
      </Box>
        </Box>
    );
  }
);
