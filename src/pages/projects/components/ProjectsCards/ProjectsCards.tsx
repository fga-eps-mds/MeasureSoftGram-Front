import React from 'react';
import Link from 'next/link';

import { Box, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

import * as Styles from './styles';

const ProjectsCards: React.FC = () => {
  const resultMock = [
    {
      id: 1,
      name: '2022-1-MeasureSoftGram-Front'
    }
  ];

  return (
    <Box display="flex">
      {resultMock.map((projects) => (
        <Styles.Wrapper>
          <Link href="/organization/name">
            <Box display="flex" alignItems="center" paddingX="15px" paddingY="10px">
              <Styles.Circle />

              <Typography variant="subtitle1">{projects.name}</Typography>

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

export default ProjectsCards;
