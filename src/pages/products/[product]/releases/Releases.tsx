import React, { useMemo, useState } from 'react';
import Head from 'next/head';

import { Box, Container, Pagination, Skeleton, Stack, TextField, Typography, Tooltip, Button, Grid } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import { useTranslation } from 'react-i18next';
import router from 'next/router';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';

import { productQuery } from '@services/product';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useRequest } from '@hooks/useRequest';
import { ReleasesPaginated } from '@customTypes/product';
import SearchButton from '@components/SearchButton';
import ReleasesTable from '../components/ReleasesList/ReleasesTable';
import filterReleaseList from './util/filterReleaseList';

const RELEASES_PER_PAGE = 10;

const Releases: NextPageWithLayout = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { data: releaseList, isLoading } = useRequest<ReleasesPaginated>(
    productQuery.getReleaseList(currentOrganization?.id as string, currentProduct?.id as string)
  );

  const filteredReleaseList = useMemo(() => filterReleaseList(releaseList! ?? [], name, startDate, endDate), [releaseList, name, startDate, endDate])
  const createRelease = () => router.push(`/products/${router.query.product}/releases/create`);

  const { t } = useTranslation('releases');

  return isLoading ? (<Skeleton />) :
    <>
      <Head>
        <title> {t('pageTitle')} </title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="column">
          <Grid container marginTop="40px" marginBottom="36px">
            <Grid item md={8} display="flex" alignItems="center">
              <Typography variant="h4" marginRight="10px" color="#33568E" fontWeight="500">
                {t('heading')}
              </Typography>
            </Grid>
            <Grid item md={4} container justifyContent="flex-end">
              <Button onClick={createRelease} startIcon={<AddchartIcon />} variant="contained">
                {t('planRelease')}
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box display="flex" flexDirection="column" padding="20px"
          style={{ backgroundColor: 'white', border: '1px solid #2B4D6F80', borderRadius: '10px' }}>
          <Grid container display="flex" justifyContent="space-between" marginBottom='30px'>
            <Grid item md={4} display="flex" alignItems="center">
              <Box>
                <Typography color="#538BA3">
                  {t('searchButtonLabel')}
                </Typography>
                <SearchButton
                  placeHolder={t('searchPlaceholder')}
                  aria-label={t('searchButtonLabel')}
                  onInput={(e) => setName(e.target.value)}
                />
              </Box>
            </Grid>
            <Grid item md={4} display="flex" alignItems="center">
              <Box>
                <Typography color="#538BA3">
                  {t('startDateLabel')}
                </Typography>
                <Tooltip title={t('startDateTooltip')}>
                  <TextField
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    inputProps={{
                      'data-testid': 'inicio-release'
                    }}
                    size='small'
                  />
                </Tooltip>
              </Box>
            </Grid>
            <Grid item md={4} display="flex" alignItems="center">
              <Box>
                <Typography color="#538BA3">
                  {t('endDateLabel')}
                </Typography>
                <Tooltip title={t('endDateTooltip')}>
                  <TextField
                    type="date"
                    required
                    size='small'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    inputProps={{
                      'data-testid': 'fim-release'
                    }}
                  />
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          <ReleasesTable releaseList={(filteredReleaseList.slice((page - 1) * RELEASES_PER_PAGE, page * RELEASES_PER_PAGE))} />
          <Stack spacing={2} sx={{ mt: 2 }} justifyContent="center" alignItems="center">
            <Pagination
              count={Math.ceil(filteredReleaseList.length / RELEASES_PER_PAGE)}
              onChange={(e, newPage) => { setPage(newPage) }}
              color='primary'
              size='large'
              shape="rounded"
            />
          </Stack>
        </Box>
      </Container >
    </>
};

Releases.getLayout = getLayout;

export default Releases;
