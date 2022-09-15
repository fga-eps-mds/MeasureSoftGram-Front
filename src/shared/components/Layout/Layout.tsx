import React from 'react';

import SideMenu from './SideMenu';
import Breadcrumbs from './Breadcrumbs';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => (
  <Styles.Wrapper>
    <SideMenu />

    <Styles.ContentContainer>
      <Breadcrumbs />
      {children}
    </Styles.ContentContainer>
  </Styles.Wrapper>
);

export default Layout;
