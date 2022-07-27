import React, { ReactElement } from 'react';

import Layout from './Layout';

export function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
}
