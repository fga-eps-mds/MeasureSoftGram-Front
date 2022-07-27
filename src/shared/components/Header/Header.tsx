import React from 'react';
import Link from 'next/link';

import { Box, Button, Container } from '@mui/material';
import { HEADER } from './consts';

import * as Styles from './styles';

const { BUTTON_OPTIONS, IMAGE_SOURCE } = HEADER.VALUES;

function Header() {
  return (
    <Styles.Wrapper>
      <Container>
        <Box display="flex" justifyContent="space-between">
          <Link href="/">
            <Styles.Logo src={IMAGE_SOURCE} height={30} />
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
