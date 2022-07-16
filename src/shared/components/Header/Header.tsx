import React from 'react';
import Link from 'next/link';

import { Button, Container } from '@mui/material';

import * as Styles from './styles';

function Header() {
  const option = [
    {
      name: 'Organizações',
      path: '/'
    },
    {
      name: 'Projetos',
      path: '/projetos'
    }
  ];

  return (
    <Container>
      <Styles.Wrapper>
        <Link href="/">
          <Styles.Logo src="/images/svg/logo.svg" />
        </Link>

        <Styles.Options>
          {option.map((option) => {
            return (
              <Link href={option.path}>
                <Button>{option.name}</Button>
              </Link>
            );
          })}
        </Styles.Options>
      </Styles.Wrapper>
    </Container>
  );
}

export default Header;
