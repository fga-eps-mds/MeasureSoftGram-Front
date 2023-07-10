import React from 'react';
import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import SideMenu from './SideMenu';
import Breadcrumbs from './Breadcrumbs';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
  rightSide?: React.ReactNode;
  disableBreadcrumb?: boolean;
}

function Layout({ children, rightSide, disableBreadcrumb = false }: Props) {
  return (
    <Styles.LayoutGrid>
      <Styles.SideMenuArea>
        <SideMenuProvider>
          <SideMenu />
        </SideMenuProvider>
      </Styles.SideMenuArea>
      <Styles.MainContentArea>
        {!disableBreadcrumb && <Breadcrumbs />}
        {children}
      </Styles.MainContentArea>
      <Styles.RightSideArea>{rightSide}</Styles.RightSideArea>
    </Styles.LayoutGrid>
  );
}

export default Layout;
