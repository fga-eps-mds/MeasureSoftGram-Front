import React from 'react';

import Link from 'next/link';

import { Box, Container, Typography } from '@mui/material';

import { useRouter } from 'next/router';
import * as Styles from './styles';
import { SUB_HEADER } from './consts';

const { OVERVIEW, MESURES, METRICS, PATH_NAME_INDEX } = SUB_HEADER.VALUES;

interface SubHeaderOptions {
  name: string;
  path: string;
  selected: boolean;
}

const routeGetter = (path: string) => {
  return path.split('/')[PATH_NAME_INDEX];
};

function SubHeader() {
  const {
    query: { projectId },
    asPath
  } = useRouter();

  const selectedPath = routeGetter(asPath);

  const options: SubHeaderOptions[] = [
    {
      name: OVERVIEW,
      path: `/projects/${projectId}/`,
      selected: selectedPath === undefined
    },
    {
      name: MESURES,
      path: `/projects/${projectId}/measures`,
      selected: selectedPath === 'measures'
    },
    {
      name: METRICS,
      path: `/projects/${projectId}/metrics`,
      selected: selectedPath === 'metrics'
    }
  ];

  return (
    <Styles.Wrapper>
      <Container>
        <Box display="flex">
          {options.map((option: SubHeaderOptions) => (
            <Link key={option.name} href={option.path}>
              <Styles.Button key={option.name} isClicked={option.selected}>
                <Typography variant="subtitle2">{option.name}</Typography>
              </Styles.Button>
            </Link>
          ))}
        </Box>
      </Container>
    </Styles.Wrapper>
  );
}

export default SubHeader;
