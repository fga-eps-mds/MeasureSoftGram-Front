/* eslint-disable react/no-array-index-key */
import * as React from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button, Typography } from '@mui/material';

import { ButtonType } from '@customTypes/product';
import * as Styles from './styles';

const { ScrollDiv } = Styles;
interface DrawerMenuProps {
  children: JSX.Element;
  open: boolean;
  buttons?: Array<ButtonType>;
  subtitle?: string;
  title?: string;
}

const DrawerMenu = ({ children, open, buttons, title, subtitle }: DrawerMenuProps) => {
  const renderButtons = () => {
    if (buttons)
      return (
        <Box marginTop="16px">
          {buttons.map((button, index) => (
            <Button
              key={`DrawerButton_${index}`}
              variant={button.variant}
              sx={{
                backgroundColor: button.backgroundColor,
                color: button.color,
                '&:hover': {
                  backgroundColor: button.hover
                },
                padding: '9px 20px',
                marginRight: '16px'
              }}
              disabled={button.disabled}
              onClick={button.onClick}
            >
              {button.label}
            </Button>
          ))}
        </Box>
      );
  };

  const renderTitle = () => {
    if (title)
      return (
        <Box sx={{ maxWidth: '700px' }}>
          <Typography variant="h4">{title}</Typography>
          {!!subtitle && <Typography mt="12px">{subtitle}</Typography>}
        </Box>
      );
  };

  return (
    <Drawer anchor="right" open={open}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        sx={{ padding: '46px 36px 34px', height: '100%' }}
      >
        <ScrollDiv>
          {renderTitle()}
          {children}
        </ScrollDiv>
        {renderButtons()}
      </Box>
    </Drawer>
  );
};

export default DrawerMenu;
