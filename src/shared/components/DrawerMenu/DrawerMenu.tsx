import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button } from '@mui/material';
import { ButtonType } from '@customTypes/project';
import * as Styles from './styles';

const { ScrollDiv } = Styles;
interface DrawerMenuProps {
  children: JSX.Element;
  open: boolean;
  buttons?: Array<ButtonType>;
}

const DrawerMenu = ({ children, open, buttons }: DrawerMenuProps) => {
  const renderButtons = () => {
    if (buttons)
      return (
        <Box marginTop="16px">
          {buttons.map((button) => (
            <Button
              key={Math.random()}
              variant={button.variant}
              sx={{
                backgroundColor: button.backgroundColor,
                color: button.color,
                padding: '9px 20px',
                marginRight: '16px'
              }}
              onClick={button.onClick}
            >
              {button.label}
            </Button>
          ))}
        </Box>
      );
  };

  return (
    <Drawer anchor="right" open={open}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        sx={{ padding: '46px 24px 34px', height: '100%' }}
      >
        <ScrollDiv>{children}</ScrollDiv>
        {renderButtons()}
      </Box>
    </Drawer>
  );
};

export default DrawerMenu;
