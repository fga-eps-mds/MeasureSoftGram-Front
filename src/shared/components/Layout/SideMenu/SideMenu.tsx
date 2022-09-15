import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Typography } from '@mui/material';

import OrganizationButton from './OrganizationSelector';
import { HEADER } from './consts';

import * as Styles from './styles';

const { MENU_OPTIONS, IMAGE_SOURCE } = HEADER.VALUES;

function Header() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const { asPath } = router;

    const pathnameArray = asPath.split('/');
    setCurrentPath(pathnameArray[1]);
  }, [router.pathname]);

  const handleClick = (path: string) => {
    router.push(path);
  };

  const isDisabled = (permissions: string[]): boolean => permissions.includes(currentPath);

  return (
    <Styles.Wrapper>
      <Link href="/">
        <Styles.Logo src={IMAGE_SOURCE} height={30} />
      </Link>

      <OrganizationButton />

      <Styles.Ul>
        {MENU_OPTIONS.map((option) => (
          <Styles.Li key={option.path}>
            <Styles.NavButton
              fullWidth
              disabled={isDisabled(option.permission)}
              onClick={() => handleClick(option.path)}
            >
              <option.icon />
              <Typography variant="button" pl="8px">
                {option.name}
              </Typography>
            </Styles.NavButton>
          </Styles.Li>
        ))}
      </Styles.Ul>
    </Styles.Wrapper>
  );
}

export default Header;
