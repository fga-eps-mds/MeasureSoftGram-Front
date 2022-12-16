import React from 'react';
import { Box, Card } from '@mui/material';

export type AuthTemplateProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export const AuthLayout = ({ children, header, footer }: AuthTemplateProps) => (
  <Box
    display="flex"
    flexDirection="column"
    gap="1rem"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    padding="2rem"
  >
    <Card variant="outlined" sx={{ padding: '2rem', minWidth: '430px' }}>
      <Box>{header}</Box>
      {children}
    </Card>

    {footer}
  </Box>
);
