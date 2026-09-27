import React, { useState } from 'react';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, CircularProgress, Container, Typography } from '@mui/material';

import { useProductContext } from '@contexts/ProductProvider';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';
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

  const { grafanaUrl, loading: isGrafanaLoading, error } = useGrafanaDashboard({
    uid: 'ad2c5q4',
  });

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
          {/* Native ECharts Pulse Chart (Issue #67) */}
          <PulseChart organizationId={organizationId} productId={productId} />

          {/* Legacy Grafana Dashboard iframe for side-by-side validation */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle1" fontWeight="bold" color="#33568E">
              Validação de Dados — Painel Grafana (Legado)
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: '70vh',
                border: '1px solid #d0d7de',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isGrafanaLoading && <CircularProgress />}
              {error && (
                <Typography color="error">Não foi possível carregar o dashboard do Grafana.</Typography>
              )}
              {grafanaUrl && !isGrafanaLoading && (
                <iframe
                  src={grafanaUrl}
                  title="Dashboard de Pulso Grafana"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ProductContent;