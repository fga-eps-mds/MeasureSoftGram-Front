import React from 'react';

import Header from '@components/Header';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <Styles.Wrapper>
      <Header />

      {children}
    </Styles.Wrapper>
  );
};

export default Layout;
