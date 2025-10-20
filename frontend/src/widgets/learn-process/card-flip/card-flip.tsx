import {forwardRef} from 'react';
import {Box} from '@mui/material';
import {CardBox} from './card-box.tsx'

interface CardFlipProps {
    question: string;
    answer: string;
    showAnswer: boolean;
    onClick?: () => void;
    className?: string;
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
       onTouchStart,
       onTouchMove,
       onTouchEnd,
       onPointerDown,
       onPointerMove,
       onPointerUp,
       onPointerLeave,
  }, ref) => {

        return (
            <Box
                sx={{
                    position: 'relative',
                    height: 400,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}

                onClick={onClick}
                className={className}
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
