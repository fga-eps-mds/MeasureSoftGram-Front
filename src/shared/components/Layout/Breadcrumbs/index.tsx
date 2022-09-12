import React from 'react';

import { Breadcrumbs as BreadcrumbsContent } from './Breadcrumbs';

import * as Styles from './styles';

function Breadcrumbs() {
  return (
    <Styles.Wrapper>
      <BreadcrumbsContent />
    </Styles.Wrapper>
  );
}

export default Breadcrumbs;
