import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Button, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import DashboardCard, { SkeletonBlock } from '@components/DashboardCard';
import ReleaseSelect from '@components/ReleaseSelect';
import { MetamodelTreeChart } from '@components/MetamodelTreeChart';
import useRequireAuth from '@hooks/useRequireAuth';
import { usePreloadECharts } from '@components/ECharts';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { getPathId } from '@utils/pathDestructer';
import { useMetamodelo } from './useMetamodelo';

const TITLE = '3. Metamodelo';

const MetamodeloDashboard: NextPageWithLayout = () => {
  useRequireAuth();
  usePreloadECharts();
  const router = useRouter();
  const [organizationId, productId] = getPathId(router.query?.product as string);

  const { releases, release, currentRelease, setReleaseId, isLoadingReleases, hasReleases, tree, status, retry } =
    useMetamodelo(organizationId, productId);

  const goToPlanRelease = () => {
    void router.push(`/products/${router.query.product}/releases/create`);
  };

  // Produto sem release orienta a planejar uma; release sem configuração orienta a revisar o planejamento.
  const emptyProps = hasReleases
    ? {
        emptyTitle: 'Esta release não tem um modelo de qualidade configurado',
        emptyDescription:
          'Os pesos e os valores de referência são definidos no planejamento da release. Escolha outra release ou revise o planejamento.',
      }
    : {
        emptyTitle: 'Este produto ainda não tem uma release configurada',
        emptyDescription:
          'O metamodelo mostra as características, subcaracterísticas, medidas e métricas configuradas para uma release, com os pesos e os valores de referência. Planeje a primeira release para vê-lo aqui.',
        emptyAction: (
          <Button
            variant="contained"
            disableElevation
            onClick={goToPlanRelease}
            sx={{ backgroundColor: DASHBOARD_COLORS.primary, fontWeight: 'bold', textTransform: 'none' }}
          >
            Planejar release
          </Button>
        ),
      };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap="28px" marginTop="40px" marginBottom="40px">
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="16px">
            <Box>
              <Typography component="h1" fontWeight="bold" fontSize="30px" color={DASHBOARD_COLORS.primary}>
                {TITLE}
              </Typography>
              <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText}>
                Como as características, subcaracterísticas, medidas e métricas da release se ligam, com o peso de
                cada uma.
              </Typography>
            </Box>

            <ReleaseSelect
              releases={releases}
              value={release?.id}
              currentReleaseId={currentRelease?.id}
              onChange={setReleaseId}
              disabled={isLoadingReleases}
            />
          </Box>

          <DashboardCard
            title="Modelo de qualidade da release"
            status={status}
            loadingContent={<SkeletonBlock width="100%" height={420} />}
            loadingMessage="Carregando o modelo de qualidade da release…"
            onRetry={retry}
            {...emptyProps}
          >
            <MetamodelTreeChart treeData={tree} />
          </DashboardCard>
        </Box>
      </Container>
    </>
  );
};

MetamodeloDashboard.getLayout = getLayout;

export default MetamodeloDashboard;
