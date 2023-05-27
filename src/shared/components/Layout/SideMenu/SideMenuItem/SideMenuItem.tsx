import React, { useRef } from 'react';

import { Box, Drawer, Tooltip } from '@mui/material';
import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import * as Styles from './styles';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useQuery } from '../../../../../pages/products/[product]/repositories/hooks/useQuery'

export type ContextControl = 'product' | 'organization' | 'repository';

type Props = {
  startIcon: JSX.Element;
  endIcon?: JSX.Element;
  text: string;
  tooltip: string;
  optype : string;
  openState: boolean;
  children?: JSX.Element;
  handlePath?: () => void;
  handleClose?: () => void;
  context: ContextControl;
};

function SideMenuItem(
  {
    startIcon, text, endIcon, tooltip, optype,
    openState, children, handleClose, context,
    handlePath
  }: Props) {

  useQuery();
  const { isCollapsed } = useSideMenuContext();
  const {currentOrganization} = useOrganizationContext();
  const {currentProduct} = useProductContext();
  const {repositoryList} = useRepositoryContext()

  const itemRef = useRef();
  let checkContext = false;
  const checkOrg  = () => (currentOrganization !== null && currentOrganization !== undefined);
  const checkProd = () => (currentProduct !== undefined && currentProduct !== null);
  const checkRepo = () => repositoryList !== null && repositoryList !== undefined && repositoryList?.length !==0;

  switch (context) {
    case 'organization':
      checkContext = checkOrg(); 
      break;

    case 'product':
      checkContext = checkOrg() && checkProd(); 
      break;

    case 'repository':
      checkContext = checkOrg()
          && checkProd()
          && checkRepo();
      break;

    default:
      checkContext = true;
      break;
  } 
  
  if ((optype === "drawer" || checkContext) ) { 
    return (<Box onClick={handleClose}
        ref={itemRef} sx={{ marginY: '2px' }}>
        <Tooltip title={tooltip} arrow placement="left">
          <Styles.Wrapper 
            $collapsed={isCollapsed}
            onClick={handlePath}
          >
            <Styles.IconContainer>{startIcon}</Styles.IconContainer>
            {!isCollapsed &&  <>
              <>
                <Box sx={{ width: '100%', marginLeft: '10px' }}>{text}</Box>
                {endIcon && <Box sx={{ paddingRight: '10px' }}>{endIcon}</Box>}
              </>
            </>}
          </Styles.Wrapper>
        </Tooltip>
        {optype === 'drawer' && <Drawer
          anchor='left'
          open={openState}
          onClose={handleClose}
        >
          {children}
        </Drawer>}
      </Box>)
  } else return null;
}

export default SideMenuItem;