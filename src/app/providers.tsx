'use client';

import React, { useEffect, useState } from 'react';
import Theme from '@components/Theme';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@contexts/Auth';
import { SWRConfig } from 'swr';
import I18nProvider from '../shared/i18n/I18nProvider';

// Modo mock (issue #64): quando NEXT_PUBLIC_API_MOCKING === 'enabled', o worker
// MSW precisa subir antes de qualquer render para interceptar as chamadas do
// axios. Fora do modo mock o valor inicial ja e true e nada acontece.
const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mockingReady, setMockingReady] = useState(!isMockingEnabled);

  // Sobe o worker MSW (client-only) e semeia a sessao fake antes de renderizar.
  useEffect(() => {
    if (!isMockingEnabled) return;
    import('../mocks/initMocks')
      .then(({ initMocks }) => initMocks())
      .catch((error) => console.error('Falha ao iniciar o modo mock:', error))
      .finally(() => setMockingReady(true));
  }, []);

  // No modo mock, espera o worker MSW estar pronto antes de montar os providers,
  // garantindo que o AuthContext leia a sessao fake ja semeada.
  if (!mockingReady) return null;

  return (
    <I18nProvider>
      <SWRConfig value={{ revalidateOnFocus: false, dedupingInterval: 60000, shouldRetryOnError: false }}>
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
                <Theme>{children}</Theme>
              </ProductProvider>
            </RepositoryProvider>
          </OrganizationProvider>
        </AuthProvider>
      </SWRConfig>
    </I18nProvider>
  );
}
