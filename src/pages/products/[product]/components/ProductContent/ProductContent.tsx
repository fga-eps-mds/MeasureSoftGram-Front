import React, { useState } from 'react';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, CircularProgress, Container, Typography } from '@mui/material';

import { useProductContext } from '@contexts/ProductProvider';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';

import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Skeleton from './Skeleton';

const ProductContent: React.FC = () => {
  const { currentProduct } = useProductContext();
  const [pathId, setPathId] = useState({} as { productId: string; organizationId: string });

  const { query } = useRouter();
  const { t } = useTranslation('overview');

  if (!Object.keys(pathId).length && currentProduct) {
    const [organizationId, productId] = getPathId(query?.product as string);
    setPathId({ organizationId, productId });
  }

  const { grafanaUrl, loading, error } = useGrafanaDashboard({
    uid: 'ad2c5q4',
  });

  const lastUpdateDate =
    currentProduct &&
    formatRelative(new Date(), new Date(), {
      locale: ptBR,
    });

  if (!currentProduct) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row" alignItems="center" marginTop="40px" marginBottom="24px">
          <Box>
            <Box display="flex">
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

      <Box
        sx={{
          width: '100%',
          height: '80vh',
          border: '1px solid #d0d7de',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading && <CircularProgress />}
        {error && (
          <Typography color="error">Não foi possível carregar o dashboard.</Typography>
        )}
        {grafanaUrl && !loading && (
          <iframe
            src={grafanaUrl}
            title="Dashboard de Pulso"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </Box>
    </Container>
  );
};

export default ProductContent;