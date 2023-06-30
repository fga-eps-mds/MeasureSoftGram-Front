import React, { useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Button, Typography, Container } from '@mui/material';

import { RepositoriesTsqmiHistory } from '@customTypes/product';

import CreateRelease from '@modules/createRelease';
import GraphicRepositoriesTsqmiHistory from '@components/GraphicRepositoriesTsqmiHistory';

import { useProductContext } from '@contexts/ProductProvider';

import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import Skeleton from './Skeleton';

interface Props {
  repositoriesTsqmiHistory?: RepositoriesTsqmiHistory;
}

const ProductContent: React.FC<Props> = ({ repositoriesTsqmiHistory }) => {
  const { currentProduct } = useProductContext();

  const [openCreateRelease, setOpenCreateRelease] = useState(false);
  const [pathId, setPathId] = useState({} as { productId: string; organizationId: string });

  const { query } = useRouter();

  if (!Object.keys(pathId).length && currentProduct) {
    const [organizationId, productId] = getPathId(query?.product as string);
    setPathId({ organizationId, productId });
  }

  const handleOpenCreateRelease = () => {
    setOpenCreateRelease(true);
  };

  const lastUpdateDate =
    currentProduct &&
    formatRelative(new Date(), new Date(), {
      locale: ptBR
    });

  if (!currentProduct || !repositoriesTsqmiHistory) {
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
                Overview
              </Typography>
              <Typography variant="h4" fontWeight="300">
                {currentProduct?.name}
              </Typography>
            </Box>
            <Typography variant="caption" color="gray">
              última atualização: {lastUpdateDate}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box display="flex" justifyContent="end">
        <Button onClick={handleOpenCreateRelease} variant="contained">
          Planejar release
        </Button>
      </Box>

      <GraphicRepositoriesTsqmiHistory history={repositoriesTsqmiHistory} />

      <CreateRelease
        open={openCreateRelease}
        handleClose={() => setOpenCreateRelease(false)}
        currentProduct={currentProduct}
        productId={pathId.productId}
        organizationId={pathId.organizationId}
      />
    </Container>
  );
};

export default ProductContent;
