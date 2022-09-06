import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Breadcrumbs as BreadcrumbsMUI, Typography } from '@mui/material';

import { TRANSLATION } from './consts';

import * as Styles from './styles';

function Breadcrumbs() {
  const router = useRouter();
  const [pathnameArray, setPathnameArray] = useState<string[]>([]);

  useEffect(() => {
    const { asPath } = router;

    console.log(router);

    const pathArray = asPath.split('/');
    setPathnameArray(pathArray);
  }, [router.pathname]);

  const currentPath: string[] = [];

  return (
    <Styles.Wrapper>
      <BreadcrumbsMUI>
        {pathnameArray.map((pathName: string, index) => {
          currentPath.push(pathName);

          if (pathnameArray.length === index + 1) {
            return (
              <Typography color="text.primary" variant="subtitle1">
                {pathName}
              </Typography>
            );
          }

          return (
            <Typography>
              <Link href={`${currentPath.join('/')}`}>{pathName}</Link>
            </Typography>
          );
        })}
      </BreadcrumbsMUI>
    </Styles.Wrapper>
  );
}

export default Breadcrumbs;
