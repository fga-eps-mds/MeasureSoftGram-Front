import React, { useEffect, useState } from 'react';
import getLayout from '@components/Layout';
import { productQuery } from '@services/product';
import { AccomplishedRepository, Characteristic, IReleases } from '@customTypes/product';
import { Box, Card, Container, Grid, Skeleton, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useTranslation } from "react-i18next";
import { formatDate } from '@utils/formatDate';
import { getPathId } from '@utils/pathDestructer';
import Head from 'next/head';
import PlannedVsAccomplishedEqualizer from '@components/PlannedVsAccomplishedEqualizer';

const Release: any = () => {
  const router = useRouter();
  const routerParams: any = router.query;
  const { t } = useTranslation('release');
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [accomplisedResults, setAccomplisedResults] = useState<AccomplishedRepository[]>([]);
  const [planned, setPlanned] = useState<Characteristic[]>([]);
  const [release, setRelease] = useState<IReleases>();
  const [selectedValue, setSelectedValue] = useState(0);
  const [selectedRepository, setSelectedRepository] = useState<AccomplishedRepository>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const [organizationId, productId] = getPathId(routerParams.product as string);
    const releaseId = routerParams.release;

    setIsLoading(true);
    setLoadError(false);

    productQuery
      .getReleaseAnalysisDataByReleaseId(organizationId, productId, releaseId)
      .then((releaseRes) => {
        setAccomplisedResults(releaseRes.data.accomplished ?? []);
        setPlanned(releaseRes.data.planned ?? []);
        setRelease(releaseRes.data.release);
      })
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [router.isReady, routerParams.product, routerParams.release]);

  useEffect(() => {
    setSelectedRepository(accomplisedResults[selectedValue]);
  }, [selectedValue, accomplisedResults]);

  const handleSelectionChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedValue(newValue);
  };

  const renderEqualizer = () => (
    <Box data-testid="equalizer-view" sx={{ width: '100%', minWidth: 0 }}>
      {loadError ? (
        <Typography color="text.secondary" data-testid="equalizer-load-error">
          {t('loadError')}
        </Typography>
      ) : (
        <PlannedVsAccomplishedEqualizer
          planned={planned ?? []}
          accomplished={selectedRepository?.characteristics}
          normDiff={selectedRepository?.norm_diff}
        />
      )}
    </Box>
  );

  const renderContent = () => (
    <Container>
      <Grid container mt={0.1} spacing={4}>
        <Grid item xs={12} md={2} sx={{ height: { md: 520 } }}>
          {/* contain: as abas roláveis não podem definir a largura mínima da página */}
          <Card sx={{ height: 'inherit', contain: 'inline-size' }}>
            <Box sx={{ display: 'flex', height: 'inherit' }}>
              <Tabs
                orientation={isDesktop ? 'vertical' : 'horizontal'}
                variant='scrollable'
                scrollButtons
                allowScrollButtonsMobile
                value={selectedValue}
                onChange={handleSelectionChange}
                sx={{
                  borderRight: { md: 1 }, borderColor: 'divider', width: '100%',
                  '& [aria-selected="true"]': {
                    backgroundColor: 'rgba(17, 61, 76, .03)',
                  },
                }}
              >
                {accomplisedResults.map((repository: AccomplishedRepository) => (
                  <Tab
                    key={repository.repository_name}
                    sx={{ fontSize: 13 }}
                    label={repository.repository_name}
                    data-testid='repository-tab'
                  />
                ))}
              </Tabs>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={10} sx={{ minWidth: 0 }}>
          {renderEqualizer()}
        </Grid>
      </Grid>
    </Container>
  );

  const renderSkeleton = () => (
    <Container>
      <Grid container mt={0.1} spacing={4}>
        <Grid item xs={12} md={2}>
          <Skeleton height={520} variant='rectangular' />
        </Grid>
        <Grid item xs={12} md={10}>
          <Skeleton height={520} variant='rectangular' />
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <>
      <Head>
        <title>{release?.release_name || 'release'}</title>
      </Head>
      <Container>
        {release && <Box>
          <Box display="flex" alignItems="center" flexWrap="wrap" columnGap="1rem">
            <Typography fontSize={{ xs: '24px', md: '32px' }} fontWeight="400">
              {t('title')}
            </Typography>
            <Typography data-testid='release-name' fontSize={{ xs: '24px', md: '32px' }} fontWeight="500" color="#33568E">
              {release?.release_name}
            </Typography>
          </Box>
          {t('release-interval')}
          <Typography data-testid='data-release' fontSize="14px" fontWeight="300">
            {formatDate(release.start_at)} - {formatDate(release.end_at)}
          </Typography>
        </Box>}
        {isLoading ? renderSkeleton() : renderContent()}
      </Container>
    </>
  );
};

Release.getLayout = getLayout;

export default Release;
