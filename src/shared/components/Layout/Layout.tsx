import React from 'react';
import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import SideMenu from './SideMenu';
import Breadcrumbs from './Breadcrumbs';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
}

function Layout({ children }: Props) {
  return (
    <Styles.LayoutGrid>
      <Styles.SideMenuArea>
        <SideMenuProvider>
          <SideMenu />
        </SideMenuProvider>
      </Styles.SideMenuArea>
      <Styles.MainContentArea>
        <Breadcrumbs />
        {children}
      </Styles.MainContentArea>
    </Styles.LayoutGrid>
  );
}

export default Layout;
