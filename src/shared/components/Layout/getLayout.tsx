import React, { ReactElement } from 'react';

import Layout from './Layout';

export function getLayout(page: ReactElement, disableBreadcrumb?: boolean) {
  return <Layout disableBreadcrumb={disableBreadcrumb}>{page}</Layout>;
}
