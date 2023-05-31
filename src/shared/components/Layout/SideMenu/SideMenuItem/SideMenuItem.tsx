import React from 'react';

import { Box, Tooltip } from '@mui/material';
import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import { useQuery } from '@pages/products/[product]/repositories/hooks/useQuery';
import * as Styles from './styles';

export type ContextControl = 'product' | 'organization' | 'repository';

interface Props {
  startIcon: React.ReactNode;
  text: string;
  endIcon?: React.ReactNode;
  tooltip: string;
  disable?: boolean;
  onClick?: (event: any) => void;
}

function SideMenuItem({ startIcon, text, endIcon, tooltip, disable, onClick }: Props) {
  useQuery();
  const { isCollapsed } = useSideMenuContext();

  return (
    <Box onClick={onClick} sx={{ marginY: '2px', display: disable ? 'none' : 'auto' }}>
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
