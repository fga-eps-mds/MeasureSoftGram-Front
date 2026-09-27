import React, { useState } from 'react';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Container, Typography } from '@mui/material';

import { useProductContext } from '@contexts/ProductProvider';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import PulseChart from '@components/PulseChart';

import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Skeleton from './Skeleton';

const ProductContent: React.FC = () => {
  const { currentProduct } = useProductContext();
  const [pathId, setPathId] = useState({} as { productId: string; organizationId: string });

  const { query } = useRouter();
  const { t } = useTranslation('overview');

  const [organizationId, productId] = getPathId(query?.product as string);

  if (!Object.keys(pathId).length && currentProduct) {
    setPathId({ organizationId, productId });
  }

  const { data: releaseData, isLoading: isReleasesLoading } = useRequest<any>(
    organizationId && productId
      ? productQuery.getReleaseList(organizationId, productId)
      : null
  );

  const releasesArray: any[] = Array.isArray(releaseData)
    ? releaseData
    : Array.isArray(releaseData?.results)
    ? releaseData.results
    : [];

  const lastUpdateDate =
    currentProduct &&
    formatRelative(new Date(), new Date(), {
      locale: ptBR,
    });

  if (!currentProduct || isReleasesLoading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  const hasNoReleases = releasesArray.length === 0;

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
              {t('last-update')} : {lastUpdateDate}
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