import React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { IconButton, Box, Typography, Container, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import RepositoriesTable from './RepositoriesTable';
import Skeleton from './Skeleton';
import * as Styles from './styles';

function RepositoriesList() {
  const { repositoryList } = useRepositoryContext();
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const router = useRouter();

  const pushToRepositoryForm = () => {
    if (currentOrganization?.id && currentProduct?.id) {
      const repositoryFormPath = `/products/${currentOrganization.id}-${currentProduct.id}/repositories/manage-repository`;
      void router.push(repositoryFormPath).catch((error: any) => toast.error(error));
    } else {
      toast.error('Organização ou Produto inválido.');
    }
  };

  if (!repositoryList) {
    return <Skeleton />;
  }

  const pushToRepositoriesPath = () => {
    if (currentOrganization?.id && currentProduct?.id) {
      const repositoriesPath = `/products/${currentOrganization.id}-${currentProduct.id}-${currentProduct.name}/repositories`;
      void router.push(repositoriesPath).catch((error: any) => toast.error(error));
    } else {
      toast.error('Organização ou Produto inválido.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" mt="42px">
      <Styles.Wrapper>
        <Container>
          <Typography variant="h5" marginRight="10px" mb="32px" color="#538BA3" fontWeight="500">
            Repositórios
            <IconButton
              color="primary"
              aria-label="add repository"
              style={{
                backgroundColor: '#538BA3',
                marginLeft: '12px',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
              }}
              onClick={() => pushToRepositoryForm()}
            >
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          </Typography>

          <RepositoriesTable maxCount={10} />
          <Box display="flex" flexDirection="column" mt="10px" alignItems="center">
            <Button onClick={() => pushToRepositoriesPath()} variant="text">
              VER MAIS...
            </Button>
          </Box>
        </Container>
      </Styles.Wrapper>
    </Box>
  );
}

export default RepositoriesList;
