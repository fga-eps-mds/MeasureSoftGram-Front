import React from 'react';
import Link from 'next/link';

import { Box, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

import * as Styles from './styles';

const OrganizationsCards: React.FC = () => {
  const resultMock = [
    {
      id: 1,
      name: 'MeasureSoftGram'
    }
  ];

  return (
    <Box display="flex">
      {resultMock.map((organization) => (
        <Styles.Wrapper>
          <Link href="/organization/name">
            <Box display="flex" alignItems="center" paddingX="15px" paddingY="10px">
              <Styles.Circle />

              <Typography variant="subtitle1">{organization.name}</Typography>

              <Box marginLeft="15px">
                <ChevronRight />
              </Box>
            </Box>
          </Link>
        </Styles.Wrapper>
      ))}
    </Box>
  );
};

export default OrganizationsCards;
