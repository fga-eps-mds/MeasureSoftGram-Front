import React from 'react';

import { Container } from '@mui/material';

import { Breadcrumbs as BreadcrumbsContent } from './Breadcrumbs';

import * as Styles from './styles';

function Breadcrumbs() {
  return (
    <Styles.Wrapper>
      <Container>
        <BreadcrumbsContent />
      </Container>
    </Styles.Wrapper>
  );
}

export default Breadcrumbs;
