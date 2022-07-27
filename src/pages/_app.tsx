import React, { ReactElement, ReactNode } from 'react';
import type { AppProps } from 'next/app';

import Theme from '@components/Theme';

import '@styles/globals.css';
import { NextPage } from 'next';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return <Theme>{getLayout(<Component {...pageProps} />)}</Theme>;
}

export default MyApp;
