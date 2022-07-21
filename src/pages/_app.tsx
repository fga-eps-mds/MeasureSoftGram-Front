import React from 'react';
import type { AppProps } from 'next/app';

import { ProjectProvider } from '@contexts/ProjectProvider';

import Theme from '@components/Theme';

import '@styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ProjectProvider>
      <Theme>
        <Component {...pageProps} />
      </Theme>
    </ProjectProvider>
  );
}

export default MyApp;
