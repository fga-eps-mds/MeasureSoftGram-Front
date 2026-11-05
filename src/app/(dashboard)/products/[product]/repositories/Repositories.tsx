'use client';

import React from 'react';
import { useRouter } from '@hooks/useRouter';

import { Box, Container, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { useProviderTranslation as useTranslation } from '@hooks/useProviderTranslation';
import RepositoriesTable from '../components/RepositoriesList/RepositoriesTable';

const Repositories: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('repositories');

  const handleAddIconClick = () => {
    void router.push('/products');
  };

  return (
    <>
      <title>{t('title')}</title>

      <Container>
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" marginTop="40px" marginBottom="36px">
            <Typography variant="h4" color="#33568E" fontWeight="500">
              {t('title')}
            </Typography>
            <IconButton
              color="primary"
              aria-label="add repository"
              style={{
                backgroundColor: '#33568E',
                marginLeft: 'auto',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
              }}
              onClick={handleAddIconClick}
            >
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box >
        <Box
          display="flex"
          flexDirection="column"
          padding="20px"
          style={{ backgroundColor: 'white', border: '1px solid #2B4D6F80', borderRadius: '10px' }}
        >
          <RepositoriesTable />
        </Box>
      </Container >
    </>
  );
};


export default Repositories;
