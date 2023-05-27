import React from 'react';
import Link from 'next/link';

import OrganizationButton from './OrganizationSelector';
import { HEADER } from './consts';

import * as Styles from './styles';
import ProductsSelector from './ProductsSelector';

const { IMAGE_SOURCE } = HEADER.VALUES;

function Header() {
  return (
    <Styles.Wrapper>
      <Link href="/home">
        <Styles.Logo src={IMAGE_SOURCE} height={30} />
      </Link>

      <OrganizationButton />
      <ProductsSelector />
    </Styles.Wrapper>
  );
}

export default Header;
