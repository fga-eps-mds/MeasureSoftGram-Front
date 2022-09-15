import React, { useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Button, Typography, Container } from '@mui/material';

import { RepositoriesSqcHistory } from '@customTypes/product';

import GraphicRepositoriesSqcHistory from '@components/GraphicRepositoriesSqcHistory';

import CreateRelease from '@pages/createRelease';

import { useProductContext } from '@contexts/ProductProvider';

import Skeleton from './Skeleton';

interface Props {
  repositoriesSqcHistory?: RepositoriesSqcHistory;
}

const ProductContent: React.FC<Props> = ({ repositoriesSqcHistory }) => {
  const { currentProduct } = useProductContext();

  const [openCreateRelease, setOpenCreateRelease] = useState(false);

  const handleOpenCreateRelease = () => {
    setOpenCreateRelease(true);
  };

  const lastUpdateDate =
    currentProduct &&
    formatRelative(new Date(), new Date(), {
      locale: ptBR
    });

  if (!currentProduct) {
    return <Skeleton />;
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
          Definir release
        </Button>
      </Box>

      <GraphicRepositoriesSqcHistory history={repositoriesSqcHistory} />

      <CreateRelease
        open={openCreateRelease}
        handleClose={() => setOpenCreateRelease(false)}
        productId={3}
        organizationId={1}
      />
    </Container>
  );
};

export default ProductContent;
