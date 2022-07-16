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
      path: '/projects'
    }
  ];

  return (
    <Styles.Wrapper>
      <Container>
        <Box display="flex" justifyContent="space-between">
          <Link href="/">
            <Styles.Logo src="/images/svg/logo.svg" height={30} />
          </Link>

          <Box display="flex">
            {options.map((option) => {
              return (
                <Box marginLeft="20px">
                  <Link href={option.path} key={option.name}>
                    <Button>{option.name}</Button>
                  </Link>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Styles.Wrapper>
  );
}

export default Header;
