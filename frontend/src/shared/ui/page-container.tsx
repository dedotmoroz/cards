import React from 'react';
import { Box, type BoxProps } from '@mui/material';

interface PageContainerProps extends BoxProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, ...props }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'auto',
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
