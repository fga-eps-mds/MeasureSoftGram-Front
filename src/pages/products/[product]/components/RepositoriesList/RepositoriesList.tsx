import React from 'react';

import { Box, Typography, Container } from '@mui/material';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import * as Styles from './styles';
import RepositoriesTable from './RepositoriesTable/RepositoriesTable';

function RepositoriesList() {
  const { repositoryList } = useRepositoryContext();
  console.log(repositoryList);

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

export default RepositoriesList;
