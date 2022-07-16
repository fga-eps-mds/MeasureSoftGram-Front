import React from 'react';
import Link from 'next/link';

import { Box, Button, Container } from '@mui/material';

import * as Styles from './styles';

function Header() {
  const options = [
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
    <Styles.Wrapper>
      <Container>
        <Box display="flex" justifyContent="space-between">
          <Link href="/">
            <Styles.Logo src="/images/svg/logo.svg" />
          </Link>

          <Styles.Options>
            {options.map((option) => {
              return (
                <Link href={option.path}>
                  <Button>{option.name}</Button>
                </Link>
              );
            })}
          </Styles.Options>
        </Box>
      </Container>
    </Styles.Wrapper>
  );
}

export default Header;
