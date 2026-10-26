import React from 'react';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Container, Typography } from '@mui/material';

import { useProductContext } from '@contexts/ProductProvider';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { ProductTsqmiReleaseHistory, RepositoriesTsqmiHistory } from '@customTypes/product';
import { PulseChart } from '@components/PulseChart';

import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import { useProviderTranslation as useTranslation } from '@hooks/useProviderTranslation';
import Skeleton from './Skeleton';
import NoReleasesState from './NoReleasesState';

const ProductContent: React.FC = () => {
  const { currentProduct } = useProductContext();
  const { query } = useRouter();
  const { t } = useTranslation('overview');

  const [organizationId, productId] = getPathId(query?.product as string);

  // Mesma requisição do PulseChart (o SWR deduplica): sem release cadastrada, a resposta vem com `releases: []`
  // (Cenário 6 da US06.01). Com erro, o PulseChart mostra o alerta, em vez de um empty state enganoso.
  const {
    data: releaseHistoryData,
    isLoading: isReleasesLoading,
    error: releaseHistoryError,
  } = useRequest<ProductTsqmiReleaseHistory>(
    organizationId && productId ? productQuery.getProductTsqmiReleaseHistoryConfig(organizationId, productId) : null
  );

  // Mesma requisição do PulseChart (o SWR deduplica): a última atualização é a medição de TSQMI mais recente.
  const { data: tsqmiHistoryData } = useRequest<RepositoriesTsqmiHistory>(
    organizationId && productId
      ? productQuery.getProductRepositoriesTsqmiHistoryConfig(organizationId, productId)
      : null
  );

  const latestMeasurementMs = Math.max(
    0,
    ...(tsqmiHistoryData?.results ?? []).flatMap((repo) =>
      (repo.history ?? []).map((m) => new Date(m.created_at).getTime())
    )
  );

  const lastUpdateDate = latestMeasurementMs
    ? formatRelative(new Date(latestMeasurementMs), new Date(), { locale: ptBR })
    : '-';

  if (!currentProduct || isReleasesLoading || !organizationId || !productId) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  const hasNoReleases = !releaseHistoryError && (releaseHistoryData?.releases ?? []).length === 0;

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row" alignItems="center" marginTop="40px" marginBottom="24px">
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h4" marginRight="10px">
                {t('title')}
              </Typography>
              <Typography variant="h4" fontWeight="500" color="#33568E">
                {currentProduct?.name}
              </Typography>
            </Box>
            <Typography variant="caption" color="gray">
              {t('last-update')}: {lastUpdateDate}
            </Typography>
          </Box>
        </Box>
      </Box>

      {hasNoReleases ? (
        <NoReleasesState productName={currentProduct?.name} />
      ) : (
        <Box display="flex" flexDirection="column" gap={4}>
          {/* Native ECharts Pulse Chart (Issue #48 / #67 / #68) */}
          <PulseChart organizationId={organizationId} productId={productId} />
        </Box>
      )}
    </Container>
  );
};

export default ProductContent;