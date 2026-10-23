import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Button, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import DashboardCard, { SkeletonBlock } from '@components/DashboardCard';
import { ExportAllCsvButton } from '@components/ExportCsvButton';
import useRequireAuth from '@hooks/useRequireAuth';
import { usePreloadECharts } from '@components/ECharts';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import {
  CORRELATION_CSV,
  CORRELATION_LEVEL_PLURALS,
  formatCorrelationCsv,
  formatCorrelationInfo
} from '@utils/formatCorrelationCharts';
import { getPathId } from '@utils/pathDestructer';

import { CollectionGuideLink } from '../distribuicao/DistributionStates';
import CorrelationBubbles, { BUBBLES_TITLE } from './CorrelationBubbles';
import CorrelationFilters from './CorrelationFilters';
import CorrelationMatrix, { matrixTitle } from './CorrelationMatrix';
import { MIN_RELEASES, useCorrelationDashboard } from './useCorrelationDashboard';

const TITLE = '6. Relações e Correlações';
const CARD_TITLE = 'Relações e Correlações';
const ERROR_TITLE = 'Não foi possível carregar as correlações';
const SKELETON_ROWS = 4;

/** Esqueleto do triângulo de baixo enquanto as correlações carregam. */
function MatrixSkeleton() {
  return (
    <Box display="flex" flexDirection="column" gap="4px">
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <Box key={row} display="flex" gap="4px">
          {Array.from({ length: row + 1 }, (__, column) => (
            <SkeletonBlock key={column} width={56} height={56} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

/**
 * As duas matrizes lado a lado, com a altura do cartão maior; em tela estreita, uma abaixo da outra. Cada célula é um
 * grid para o cartão esticar até o fim dela.
 */
function CorrelationGrid({ matrix, bubbles, busy }: { matrix: ReactNode; bubbles: ReactNode; busy?: boolean }) {
  return (
    <Box
      data-testid="correlation-grid"
      aria-busy={busy}
      display="grid"
      gap="24px"
      sx={{
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
        opacity: busy ? 0.6 : 1,
        transition: 'opacity 150ms'
      }}
    >
      <Box display="grid" minWidth={0}>
        {matrix}
      </Box>
      <Box display="grid" minWidth={0}>
        {bubbles}
      </Box>
    </Box>
  );
}

const CorrelationDashboard: NextPageWithLayout = () => {
  useRequireAuth();
  usePreloadECharts();
  const { terms } = useProviderTerms();
  const router = useRouter();
  const [organizationId, productId] = getPathId(router.query?.product as string);

  const dashboard = useCorrelationDashboard(organizationId, productId);
  const { repository, level, correlation, status, isUpdating, retry } = dashboard;
  const noun = CORRELATION_LEVEL_PLURALS[level];
  // a exportação geral leva as duas matrizes da tela, com os filtros aplicados
  const csvCharts =
    status === 'ready' && correlation
      ? [CORRELATION_CSV.matrix, CORRELATION_CSV.bubbles].map((name) => formatCorrelationCsv(correlation, name))
      : [];

  const renderContent = () => {
    if (status === 'error') {
      return <DashboardCard title="Falha ao carregar" status="error" errorTitle={ERROR_TITLE} onRetry={retry} />;
    }

    if (status === 'noRepository') {
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          emptyTitle={`Este produto ainda não tem ${terms.repositories}`}
          emptyDescription={`Adicione um ${terms.repository} ao produto e rode a coleta do MeasureSoftGram para ver as correlações.`}
        />
      );
    }

    if (status === 'noRelease') {
      return (
        <DashboardCard
          title="Produto sem release"
          status="empty"
          badgeLabel="Sem release"
          emptyTitle="Este produto ainda não tem release"
          emptyDescription={`A correlação compara os valores das ${noun} entre as releases. Planeje a primeira release para começar.`}
          emptyAction={
            <Button
              variant="contained"
              disableElevation
              onClick={() => void router.push(`/products/${router.query.product}/releases/create`)}
              sx={{ backgroundColor: DASHBOARD_COLORS.primary, fontWeight: 'bold', textTransform: 'none' }}
            >
              Planejar release
            </Button>
          }
        />
      );
    }

    if (status === 'noEntities') {
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          emptyTitle={`A configuração do modelo tem menos de 2 ${noun}`}
          emptyDescription="A correlação precisa de pelo menos duas entidades no nível. Escolha outro nível ou confira a configuração do modelo da release."
        />
      );
    }

    if (status === 'noAnalyses' && correlation) {
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          badgeLabel="Sem análise"
          emptyTitle={`O ${terms.repository} ${correlation.repository.name} não tem análises nas releases do produto`}
          emptyDescription={`Os valores das ${noun} aparecem quando a Action ou a CLI do MeasureSoftGram roda no ${terms.repository} dentro do período de uma release. Escolha outro ${terms.repository} ou configure a coleta.`}
          emptyAction={<CollectionGuideLink />}
        />
      );
    }

    if (status === 'fewReleases' && correlation) {
      const count = correlation.releases.length === 1 ? '1 release' : `${correlation.releases.length} releases`;
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          badgeLabel="Poucas releases"
          emptyTitle="Faltam releases para calcular a correlação"
          emptyDescription={`A correlação precisa de pelo menos ${MIN_RELEASES} releases com valor para todas as ${noun}, e o ${terms.repository} ${correlation.repository.name} tem ${count}.`}
        />
      );
    }

    if (status === 'ready' && correlation) {
      return (
        <CorrelationGrid
          busy={isUpdating}
          matrix={<CorrelationMatrix correlation={correlation} />}
          bubbles={<CorrelationBubbles correlation={correlation} />}
        />
      );
    }

    return (
      <CorrelationGrid
        matrix={<DashboardCard title={matrixTitle({ level })} status="loading" loadingContent={<MatrixSkeleton />} />}
        bubbles={<DashboardCard title={BUBBLES_TITLE} status="loading" loadingContent={<MatrixSkeleton />} />}
      />
    );
  };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap="24px" marginTop="40px" marginBottom="40px">
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap="16px">
            <Box>
              <Typography component="h1" fontWeight="bold" fontSize="30px" color={DASHBOARD_COLORS.primary}>
                {TITLE}
              </Typography>
              <Typography color={DASHBOARD_COLORS.mutedText} data-testid="correlation-subtitle">
                Como as {noun} de <em>{repository?.name ?? `um ${terms.repository}`}</em> variam juntas ao longo das
                releases
              </Typography>
            </Box>
            <ExportAllCsvButton dashboard={CORRELATION_CSV.dashboard} charts={csvCharts} />
          </Box>

          <CorrelationFilters {...dashboard} />

          {status === 'ready' && correlation && (
            <Typography fontSize="14px" color={DASHBOARD_COLORS.text} data-testid="correlation-info">
              {formatCorrelationInfo(correlation)}
            </Typography>
          )}

          {renderContent()}
        </Box>
      </Container>
    </>
  );
};

CorrelationDashboard.getLayout = getLayout;

export default CorrelationDashboard;
