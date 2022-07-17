import React from 'react';
import Link from 'next/link';

import { Box, Button, Container } from '@mui/material';
import { HEADER } from './Header.consts';
const { BUTTON_OPTIONS } = HEADER.VALUES;
const { BUTTON_TEST_ID } = HEADER.TEST_ID;

import * as Styles from './styles';

function Header() {
  return (
    <Styles.Wrapper>
      <Container>
        <Box display="flex" justifyContent="space-between">
          <Link href="/">
            <Styles.Logo src="/images/svg/logo.svg" height={30} />
          </Link>

          <Box display="flex">
            {BUTTON_OPTIONS.map((option) => (
              <Box key={option.name} marginLeft="20px">
                <Link href={option.path} key={option.name}>
                  <Button>{option.name}</Button>
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Styles.Wrapper>
  );
}

export default Header;
