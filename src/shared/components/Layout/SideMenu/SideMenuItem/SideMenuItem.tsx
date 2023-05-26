import React from 'react';

import { Box, Tooltip } from '@mui/material';
import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import * as Styles from './styles';

type Props = {
  startIcon: JSX.Element;
  endIcon?: JSX.Element;
  text: string;
  tooltip: string;
};

function SideMenuItem({ startIcon, text, endIcon, tooltip }: Props) {
  const { isCollapsed } = useSideMenuContext();

  return (
    <Box sx={{ marginY: '2px' }}>
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
    </Box>
  );
}

export default SideMenuItem;
