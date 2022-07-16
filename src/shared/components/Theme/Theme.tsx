import React from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import palette from './palette';

const theme = createTheme({ ...palette });

interface Props {
  children: React.ReactNode;
}

const Theme: React.FC<Props> = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default Theme;
