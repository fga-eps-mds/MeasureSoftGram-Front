import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Breadcrumbs as BreadcrumbsMUI, Typography } from '@mui/material';

import { TRANSLATION } from './consts';

export function Breadcrumbs() {
  const router = useRouter();

  function getPathName(name: string) {
    const nameArray = name.split('-');
    return nameArray.slice(1).join('-');
  }

  const getCrumbs = () => {
    const { asPath } = router;
    const currentPath: string[] = [];
    const pathArray = asPath.split('/').slice(1);

    return pathArray.map((path, index) => {
      currentPath.push(path);

      if (pathArray[0] === '') {
        return (
          <Typography color="text.primary" variant="subtitle1" key={path}>
            Produtos
          </Typography>
        );
      }

      if (pathArray.length === index + 1)
        return (
          <Typography color="text.primary" variant="subtitle1" key={path}>
            {TRANSLATION[path] || getPathName(path)}
          </Typography>
        );

      return (
        <Typography key={path}>
          <Link href={`/${currentPath.join('/')}`}>{TRANSLATION[path] || getPathName(path)}</Link>
        </Typography>
      );
    });
  };

  return <BreadcrumbsMUI>{getCrumbs()}</BreadcrumbsMUI>;
}
