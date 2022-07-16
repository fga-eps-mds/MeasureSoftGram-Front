import React from 'react';

import Header from '@components/Header';
import SubHeader from '@components/SubHeader';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <Styles.Wrapper>
      <Header />
      <SubHeader />

      {children}
    </Styles.Wrapper>
  );
};

export default Layout;
