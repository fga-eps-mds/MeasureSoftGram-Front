import React from 'react';
import { useRouter } from 'next/router';
import { IconButton, Box, Typography, Container, Button, Table, TableBody, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useTranslation } from 'react-i18next';
import RepositoriesTable from './RepositoriesTable';
import Skeleton from './Skeleton';
import * as Styles from './styles';

function RepositoriesList() {
  const { repositoryList } = useRepositoryContext();
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { t } = useTranslation('repositories')
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
          <Typography variant="h5" marginRight="10px" mb="16px" color="#538BA3" fontWeight="500">
            {t('title')}
            <IconButton
              color="primary"
              aria-label="add repository"
              style={{
                backgroundColor: '#538BA3',
                marginLeft: '80%',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
              }}
              onClick={() => pushToRepositoriesPath()}
            >
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          </Typography>

          <RepositoriesTable maxCount={10}>
            <Table>
              <TableBody>
                {repositoryList.map((repository: any) => (
                  <TableRow key={repository.id}>
                    <TableCell>{repository.name}</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="delete"
                        onClick={() => {/* Implemente a lógica de delete aqui, se necessário */ }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </RepositoriesTable>

          <Box display="flex" flexDirection="column" mt="10px" alignItems="center">
            <Button onClick={() => pushToRepositoriesPath()} variant="text" data-testid="button-ver-mais">
              {t('more')}
            </Button>
          </Box>
        </Container>
      </Styles.Wrapper>
    </Box>
  );
}

export default RepositoriesList;
