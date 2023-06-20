import React, { useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Button, Typography, Container } from '@mui/material';

import { RepositoriesSqcHistory } from '@customTypes/product';

import CreateRelease from '@modules/createRelease';
import GraphicRepositoriesSqcHistory from '@components/GraphicRepositoriesSqcHistory';

import { useProductContext } from '@contexts/ProductProvider';

import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import Skeleton from './Skeleton';

interface Props {
  repositoriesSqcHistory?: RepositoriesSqcHistory;
}

const ProductContent: React.FC<Props> = ({ repositoriesSqcHistory }) => {
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

  if (!currentProduct || !repositoriesSqcHistory) {
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

      <GraphicRepositoriesSqcHistory history={repositoriesSqcHistory} />

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
