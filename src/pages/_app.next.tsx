import '@styles/globals.css';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import React, { ReactElement, useEffect, useState } from 'react';
import Theme from '@components/Theme';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@contexts/Auth';
import { useRouter } from 'next/router';
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
  const [modalOpen, setModalOpen] = useState(false);
  const disableBreadcrumb = Component.disableBreadcrumb ?? false;

  const router = useRouter();

  useEffect(() => {
    let timeoutId;

    const handleRouteChange = () => {
      console.log(`App is changing to`);
      setModalOpen(false);

      // Set timeout for 2 seconds before showing the loading animation
      timeoutId = setTimeout(() => {
        setLoading(true);
        setModalOpen(true);
      }, 2000);
    };

    const handleRouteComplete = () => {
      console.log('you have finished going to the new page');
      clearTimeout(timeoutId);
      setLoading(false);
      setModalOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
      clearTimeout(timeoutId);
    };
  }, []);

  // Ensure the modal doesn't open if the loading is faster than the delay
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        setModalOpen(true);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

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
                  open={modalOpen}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100vw',
                      height: '100vh',
                    }}
                  >
                    <div
                      style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <RotatingLines
                        strokeColor="#33568E"
                        strokeWidth="5"
                        width="50"
                        animationDuration="0.75"
                        timeout={3000}
                      />
                      <h3
                        style={{
                          position: 'absolute',
                          top: '75%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '24px',
                          color: '#000000',
                          textShadow: `
                            -1px -1px 0 #33568E,
                            1px -1px 0 #33568E,
                            -1px  1px 0 #33568E,
                            1px  1px 0 #33568E
                          `,
                        }}
                      >
                        Carregando...
                      </h3>
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
