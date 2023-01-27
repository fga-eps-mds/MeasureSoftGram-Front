import '@styles/globals.css';

import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import React, { ReactElement } from 'react';

import Theme from '@components/Theme';

import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type {} from '@mui/lab/themeAugmentation';
import { AuthProvider } from '@contexts/Auth';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => typeof page;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AuthProvider>
      <OrganizationProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <RepositoryProvider>
          <ProductProvider>
            <Theme>{getLayout(<Component {...pageProps} />)}</Theme>
          </ProductProvider>
        </RepositoryProvider>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default MyApp;
