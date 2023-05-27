import React, { useEffect, useRef, useState } from 'react';

import { Box, Button, Drawer, SwipeableDrawer, Tooltip } from '@mui/material';
import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import * as Styles from './styles';

type Props = {
  startIcon: JSX.Element;
  endIcon?: JSX.Element;
  text: string;
  tooltip: string;
  type : 'drawer' | 'route';
  openState: boolean;
  children?: JSX.Element;
  handleClose: () => void;
};

function SideMenuItem({ startIcon, text, endIcon, tooltip, type, openState, children, handleClose}: Props) {
  const { isCollapsed } = useSideMenuContext();

  const itemRef = useRef();
  
  return (
    <Box onClick={() => handleClose()}
      ref={itemRef} sx={{ marginY: '2px' }}>
      <Tooltip title={tooltip} arrow placement="left">
        <Styles.Wrapper $collapsed={isCollapsed}>
          <Styles.IconContainer>{startIcon}</Styles.IconContainer>
          {!isCollapsed && (
            <>
              <Box sx={{ width: '100%', marginLeft: '10px' }}>{text}</Box>
              {endIcon && <Box sx={{ paddingRight: '10px' }}>{endIcon}</Box>}
            </>
          )}
        </Styles.Wrapper>
      </Tooltip>
      {type === 'drawer' && <Drawer
        anchor='left'
        open={openState}
        onClose={handleClose}
      >
        {children}
      </Drawer>}
    </Box>
  );
}

export default SideMenuItem;