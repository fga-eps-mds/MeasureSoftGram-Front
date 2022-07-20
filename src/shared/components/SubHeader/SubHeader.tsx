import React from 'react';

import Link from 'next/link';

import { Box, Container, Typography } from '@mui/material';

import { useRouter } from 'next/router';
import * as Styles from './styles';

interface SubHeaderOptions {
  name: string;
  path: string;
  selected: boolean;
}

function SubHeader() {
  const {
    query: { layer, project }
  } = useRouter();

  const options: SubHeaderOptions[] = [
    {
      name: 'Overview',
      path: `/projects/${project}/`,
      selected: layer === undefined
    },
    {
      name: 'Medidas',
      path: `/projects/${project}/measures`,
      selected: layer === 'measures'
    },
    {
      name: 'Métricas',
      path: `/projects/${project}/metrics`,
      selected: layer === 'metrics'
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
