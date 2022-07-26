import React from 'react';

import Header from '@components/Header';
import SubHeader from '@components/SubHeader';

import * as Styles from './styles';
import { useRouter } from 'next/router';

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
