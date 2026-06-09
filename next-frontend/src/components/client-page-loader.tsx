"use client";

import { Box, CircularProgress } from "@mui/material";

export function ClientPageLoader() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="50vh"
    >
      <CircularProgress />
    </Box>
  );
}
