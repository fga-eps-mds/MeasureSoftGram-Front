import React from 'react';
import Link from 'next/link';

import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import Divider from '@mui/material/Divider';

import * as Styles from './styles';

import OrganizationButton from '../OrganizationSelector';
import ProductsSelector from '../ProductsSelector';

const IMAGE_SOURCE = '/images/svg/logo.svg';

function SideMenuWrapper() {
  return (
    <Styles.Wrapper>
      <Link href="/products">
        <Styles.Logo src={IMAGE_SOURCE} height={30} />
      </Link>
      <OrganizationButton />
      <ProductsSelector />
      <Styles.CollapseButton>
        <NavigateBeforeRoundedIcon fontSize="large" />
      </Styles.CollapseButton>
      <Divider sx={{ width: '100%', my: '15px', border: '1px solid rgba(0, 0, 0, 0.20)' }} />
      <Styles.ItemContainer />
      <Divider sx={{ width: '100%', my: '15px', border: '1px solid rgba(0, 0, 0, 0.20)' }} />
    </Styles.Wrapper>
  );
}

export default SideMenuWrapper;
