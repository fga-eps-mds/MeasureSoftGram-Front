import React from 'react';
import { useRouter } from 'next/router';

import Header from '@components/Header';
import SubHeader from '@components/SubHeader';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const { query } = useRouter();

  const hasSubHeader = query?.projectId;

  return (
    <Styles.Wrapper>
      <Styles.HeaderBox>
        <Header />
        {hasSubHeader && <SubHeader />}
      </Styles.HeaderBox>

      {children}
    </Styles.Wrapper>
  );
};

export default Layout;
