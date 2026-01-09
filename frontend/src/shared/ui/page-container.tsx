import React, { useEffect } from 'react';
import { Box, type BoxProps } from '@mui/material';

interface PageContainerProps extends BoxProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, ...props }) => {
  useEffect(() => {
    // Применяем стили к body при монтировании
    const originalStyle = document.body.style.cssText;
    document.body.style.cssText = `
      overscroll-behavior: none;
      overscroll-behavior-y: none;
      overscroll-behavior-x: none;
      overflow: hidden;
      height: 100vh;
      position: fixed;
      width: 100%;
      top: 0;
      left: 0;
      touch-action: pan-y pan-x;
    `;

    // Предотвращаем pull-to-refresh и overscroll через обработчики событий
    let lastTouchY = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - lastTouchY;
      
      // Предотвращаем pull-to-refresh когда вверху страницы и тянем вниз
      if (window.scrollY === 0 && deltaY > 0) {
        e.preventDefault();
        return;
      }
      
      // Предотвращаем overscroll вниз
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      if (window.scrollY + clientHeight >= scrollHeight && deltaY < 0) {
        e.preventDefault();
        return;
      }
      
      lastTouchY = currentY;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Восстанавливаем оригинальные стили при размонтировании
    return () => {
      document.body.style.cssText = originalStyle;
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
