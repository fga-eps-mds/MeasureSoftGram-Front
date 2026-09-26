import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Box, Container, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import { useTranslation } from 'react-i18next';
import RepositoriesTable from '../components/RepositoriesList/RepositoriesTable';

const Repositories: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation('repositories');

  const handleAddIconClick = () => {
    router.push('/products');
  };

  return (
    <>
      <Head>
        <title>{t('title')}</title>
      </Head>

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

Repositories.getLayout = getLayout;

export default Repositories;
