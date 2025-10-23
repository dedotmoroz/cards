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
      overflow: hidden;
      height: 100vh;
    `;

    // Восстанавливаем оригинальные стили при размонтировании
    return () => {
      document.body.style.cssText = originalStyle;
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
