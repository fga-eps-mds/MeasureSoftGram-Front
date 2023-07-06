import React from 'react';

import { Box, Typography, Container, Button } from '@mui/material';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import RepositoriesTable from './RepositoriesTable';
import Skeleton from './Skeleton';

import * as Styles from './styles';

function RepositoriesList() {
  const { repositoryList } = useRepositoryContext();
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const router = useRouter();

  const pushToRepositoriesPath = () => {
    const repositoriesPath = `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories`;
    void router.push(repositoriesPath).catch((error: any) => toast.error(error));
  };

  if (!repositoryList) {
    return <Skeleton />;
  }

  return (
    <Box display="flex" flexDirection="column" mt="42px">
      <Styles.Wrapper>
        <Container>
          <Typography variant="h5" marginRight="10px" mb="32px" color="#538BA3" fontWeight="500">
            Repositórios
          </Typography>

          <RepositoriesTable maxCount={10} />
          <Box display="flex" flexDirection="column" mt="10px" alignItems="center">
            <Button onClick={() => void pushToRepositoriesPath()} variant="text">
              VER MAIS...
            </Button>
          </Box>
        </Container>
      </Styles.Wrapper>
    </Box>
  );
}

export default RepositoriesList;
