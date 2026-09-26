import React from 'react';

import { Box, Typography, Container, Button } from '@mui/material';

import { productQuery } from '@services/product';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useRequest } from '@hooks/useRequest';
import { ReleasesPaginated } from '@customTypes/product';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import ReleasesTable from './ReleasesTable';

import * as Styles from './styles';
import Skeleton from './Skeleton';

function ReleasesList() {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const router = useRouter();
  const { t } = useTranslation('sidebar');

  const { data: release, isLoading } = useRequest<any>(
    productQuery.getReleaseList(currentOrganization?.id as string, currentProduct?.id as string)
  );

  const releaseList: ReleasesPaginated = release?.results || [];

  if (isLoading) return <Skeleton />;

  function pushToReleasesPath() {
    const releasesPath = `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/releases`;
    void router.push(releasesPath);
  }


  return (
    <Box display="flex" flexDirection="column" mt="42px">
      <Styles.Wrapper>
        <Container>
          <Typography variant="h5" marginRight="10px" mb="32px" color="#538BA3" fontWeight="500">
            Última Release criada
          </Typography>

          <ReleasesTable releaseList={releaseList?.slice(0, 1) ?? []} />
          <Box display="flex" flexDirection="column" mt="10px" alignItems="center">
            <Button data-testid="ver-mais-release" onClick={() => pushToReleasesPath()} variant="text">
              {t('release.more')}
            </Button>
          </Box>
        </Container>
      </Styles.Wrapper>
    </Box>
  );
}

export default ReleasesList;
