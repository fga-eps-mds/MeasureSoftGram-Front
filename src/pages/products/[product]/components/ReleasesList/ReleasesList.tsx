import React from 'react';

import { Box, Typography, Container } from '@mui/material';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import RepositoriesTable from './ReleasesTable';
import Skeleton from './Skeleton';

import * as Styles from './styles';

function ReleasesList() {
  const { repositoryList } = useRepositoryContext();

  if (!repositoryList) {
    return <Skeleton />;
  }

  return (
    <Box display="flex" flexDirection="column" mt="42px">
      <Styles.Wrapper>
        <Container>
          <Typography variant="h5" marginRight="10px" mb="32px">
            Repositórios
          </Typography>

          <RepositoriesTable />
        </Container>
      </Styles.Wrapper>
    </Box>
  );
}

export default ReleasesList;
