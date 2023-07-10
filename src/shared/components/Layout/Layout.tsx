import React from 'react';
import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import SideMenu from './SideMenu';
import Breadcrumbs from './Breadcrumbs';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
  disableBreadcrumb?: boolean;
}

function Layout({ children, disableBreadcrumb = false }: Props) {
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
    </Styles.LayoutGrid>
  );
}

export default Layout;
