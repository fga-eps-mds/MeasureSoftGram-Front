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
import { AuthProvider } from '@contexts/Auth';
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useState } from 'react';
import { RotatingLines } from 'react-loader-spinner';
import { Modal, Box } from '@mui/material';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement, disableBreadcrumb?: boolean) => typeof page;
  disableBreadcrumb?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const [loading, setLoading] = useState(false);
  const disableBreadcrumb = Component.disableBreadcrumb ?? false;
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const router = useRouter()
  useEffect(() => {

    const handleRouteChange = () => {
      console.log(`App is changing to`)
      setLoading(true);
      return;
    };

    const handleRouteComplete = () => {
      console.log('you have finished going to the new page')
      setLoading(false);
      return;
    };

    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteComplete)// If the component is unmounted, unsubscribe

    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])

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
            <Theme>
              {getLayout(<Component {...pageProps} />, disableBreadcrumb)}
              <>
                <Modal
                  open={loading}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400
                  }}>
                    <div style={{ position: "fixed", left: "50%", transform: "translate(-50%, -50%)" }}>
                      <RotatingLines
                        strokeColor="#33568e"
                        strokeWidth="5"
                        width="50"
                        animationDuration="0.75"
                        timeout={3000}
                      />
                      <h3 style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, 50%)" }}>Carregando...</h3>
                    </div>
                  </Box>
                </Modal>
              </>

            </Theme>
          </ProductProvider>
        </RepositoryProvider>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default MyApp;
