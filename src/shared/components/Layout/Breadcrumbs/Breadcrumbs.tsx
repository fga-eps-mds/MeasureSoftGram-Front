import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Breadcrumbs as BreadcrumbsMUI, Typography } from '@mui/material';

import { TRANSLATION } from './consts';

export function Breadcrumbs() {
  const router = useRouter();
  const [pathnameArray, setPathnameArray] = useState<string[] | React.ReactElement[]>([]);

  function getPathName(name: string) {
    const nameArray = name.split('-');
    return nameArray.slice(1).join('-');
  }

  useEffect(() => {
    const { asPath } = router;
    const currentPath: string[] = [];
    const pathArray = asPath.split('/').slice(1);

    const breadcrumbArray = pathArray.map((path, index) => {
      currentPath.push(path);

      if (pathArray.length === index + 1)
        return (
          <Typography color="text.primary" variant="subtitle1">
            {TRANSLATION[path] || getPathName(path)}
          </Typography>
        );

      return (
        <Typography>
          <Link href={`/${currentPath.join('/')}`}>{TRANSLATION[path] || getPathName(path)}</Link>
        </Typography>
      );
    });

    setPathnameArray(breadcrumbArray);
  }, [router]);

  if (pathnameArray[0] === '') {
    return (
      <BreadcrumbsMUI>
        <Typography color="text.primary" variant="subtitle1">
          Produtos
        </Typography>
      </BreadcrumbsMUI>
    );
  }

  return <BreadcrumbsMUI>{pathnameArray.map((path) => path)}</BreadcrumbsMUI>;
}
