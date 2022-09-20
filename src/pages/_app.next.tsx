import '@styles/globals.css';

import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import React, { ReactElement } from 'react';

import Theme from '@components/Theme';

import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => typeof page;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <OrganizationProvider>
      <RepositoryProvider>
        <ProductProvider>
          <Theme>{getLayout(<Component {...pageProps} />)}</Theme>
        </ProductProvider>
      </RepositoryProvider>
    </OrganizationProvider>
  );
}

export default MyApp;
