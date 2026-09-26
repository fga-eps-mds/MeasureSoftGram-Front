import React, { useEffect, useState } from 'react';
import getLayout from '@components/Layout';
import { productQuery } from '@services/product';
import { grafanaService } from '@services/grafana';
import { AccomplishedRepository, Characteristic, IReleases } from '@customTypes/product';
import { Box, Card, CircularProgress, Container, Grid, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from "react-i18next";
import { formatDate } from '@utils/formatDate';
import { getPathId } from '@utils/pathDestructer';
import Head from 'next/head';

const PLANEJADO_VS_REALIZADO_PANEL_ID = 8;
const VISAO_GERAL_UID = '5904a9de-7f42-453c-9a93-1175d1fe6918';

const Release: any = () => {
  const router = useRouter();
  const routerParams: any = router.query;
  const { t } = useTranslation('release');

  const [accomplisedResults, setAccomplisedResults] = useState<AccomplishedRepository[]>([]);
  const [planned, setPlanned] = useState<Characteristic[]>([]);
  const [release, setRelease] = useState<IReleases>();
  const [selectedValue, setSelectedValue] = useState(0);
  const [selectedRepository, setSelectedRepository] = useState<AccomplishedRepository>();
  const [isLoading, setIsLoading] = useState(true);

  const [productRepos, setProductRepos] = useState<{ id: number; name: string }[]>([]);
  const [panelUrl, setPanelUrl] = useState<string | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const [organizationId, productId] = getPathId(routerParams.product as string);
    const releaseId = routerParams.release;

    setIsLoading(true);

    Promise.all([
      productQuery.getReleaseAnalysisDataByReleaseId(organizationId, productId, releaseId),
      productQuery.getAllRepositories(organizationId, productId),
    ]).then(([releaseRes, reposRes]) => {
      setAccomplisedResults(releaseRes.data.accomplished);
      setPlanned(releaseRes.data.planned);
      setRelease(releaseRes.data.release);
      setProductRepos(reposRes.data.results.map((r: any) => ({ id: r.id, name: r.name })));
      setIsLoading(false);
    });
  }, [router.isReady, routerParams.product, routerParams.release]);

  useEffect(() => {
    setSelectedRepository(accomplisedResults[selectedValue]);
  }, [selectedValue, accomplisedResults]);

  useEffect(() => {
    if (!selectedRepository || productRepos.length === 0) return;

    const [, productId] = getPathId(routerParams.product as string);
    const matched = productRepos.find((r) => r.name === selectedRepository.repository_name);
    if (!matched) return;

    setPanelLoading(true);
    setPanelUrl(null);

    grafanaService
      .getDashboardUrl(VISAO_GERAL_UID, Number(productId), matched.id)
      .then((res) => {
        setPanelUrl(`${res.data.grafana_url}&viewPanel=${PLANEJADO_VS_REALIZADO_PANEL_ID}`);
        setPanelLoading(false);
      })
      .catch(() => setPanelLoading(false));
  }, [selectedRepository, productRepos, routerParams.product]);

  const handleSelectionChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedValue(newValue);
  };

  const renderContent = () => (
    <Container>
      <Grid container mt={0.1} spacing={4}>
        <Grid item xs={2} height={520}>
          <Card sx={{ height: 'inherit' }}>
            <Box sx={{ display: 'flex', height: 'inherit' }}>
              <Tabs
                orientation='vertical'
                variant='scrollable'
                scrollButtons
                allowScrollButtonsMobile
                value={selectedValue}
                onChange={handleSelectionChange}
                sx={{
                  borderRight: 1, borderColor: 'divider', width: '100%',
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

        <Grid item xs={10}>
          <Box
            sx={{
              width: '100%',
              height: '520px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d0d7de',
              borderRadius: '8px',
            }}
          >
            {panelLoading && <CircularProgress />}
            {!panelLoading && !panelUrl && (
              <Typography color="text.secondary">Selecione um repositório</Typography>
            )}
            {panelUrl && !panelLoading && (
              <iframe
                src={panelUrl}
                title="Planejado vs Realizado"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );

  const renderSkeleton = () => (
    <Container>
      <Grid container mt={0.1} spacing={4}>
        <Grid item xs={2}>
          <Skeleton height={520} variant='rectangular' />
        </Grid>
        <Grid item xs={10}>
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {release && <Box>
            <Box display="flex" alignItems="center" gap="1rem">
              <Typography fontSize="32px" fontWeight="400">
                {t('title')}
              </Typography>
              <Typography data-testid='release-name' fontSize="32px" fontWeight="500" color="#33568E">
                {release?.release_name}
              </Typography>
            </Box>
            {t('release-interval')}
            <Typography data-testid='data-release' fontSize="14px" fontWeight="300">
              {formatDate(release.start_at)} - {formatDate(release.end_at)}
            </Typography>
          </Box>}
        </Box>
        {isLoading ? renderSkeleton() : renderContent()}
      </Container>
    </>
  );
};

Release.getLayout = getLayout;

export default Release;
