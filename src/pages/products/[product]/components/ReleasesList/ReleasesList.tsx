import React from 'react';

import { Box, Typography, Container } from '@mui/material';

import { productQuery } from '@services/product';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useRequest } from '@hooks/useRequest';
import { CompareGoalAccomplished } from '@customTypes/product';
import RepositoriesTable from './ReleasesTable';

import * as Styles from './styles';
import Skeleton from './Skeleton';

function ReleasesList() {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const { data: releaseList, isLoading } = useRequest<CompareGoalAccomplished[]>(
    productQuery.getReleaseList(currentOrganization?.id, currentProduct?.id as string)
  );
  if (isLoading) return <Skeleton />;
  return (
    <Box display="flex" flexDirection="column" mt="42px">
      <Styles.Wrapper>
        <Container>
          <Typography variant="h5" marginRight="10px" mb="32px" color="#538BA3" fontWeight="500">
            Releases
          </Typography>

          <RepositoriesTable releaseList={releaseList} />
        </Container>
      </Styles.Wrapper>
    </Box>
  );
}

export default ReleasesList;
