import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { FileMetricKey, MetricDistributionRepository } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import {
  COMPARISON_CHART_HEIGHT,
  ComparisonRepository,
  formatComparisonChartOptions
} from '@utils/formatDistributionCharts';
import { getComparisonMissingDataMessage, MetricReference } from '@utils/metricDistribution';
import DistributionChart from './DistributionChart';
import { ChartSkeleton, CollectionGuideLink, DistributionErrorCard, NO_FILE_DATA_BADGE } from './DistributionStates';

interface RepositoriesComparisonProps {
  metric: FileMetricKey;
  releaseName: string;
  /** Repositórios da release, para saber quais não têm dados por arquivo. */
  repositories: MetricDistributionRepository[];
  comparison?: ComparisonRepository[];
  reference: MetricReference | null;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

/** Um boxplot por repositório da release na mesma métrica (CA6). */
export default function RepositoriesComparison({
  metric,
  releaseName,
  repositories,
  comparison,
  reference,
  isLoading,
  error,
  onRetry
}: RepositoriesComparisonProps) {
  const { terms } = useProviderTerms();
  const option = useMemo(
    () =>
      comparison?.length ? formatComparisonChartOptions(metric, comparison, reference, terms.repository) : undefined,
    [metric, comparison, reference, terms.repository]
  );
  const withoutData = repositories.filter((item) => !item.summary).map((item) => item.repository_name);
  const title = `${metric} por ${terms.repository} · ${releaseName}`;

  if (error) {
    return <DistributionErrorCard onRetry={onRetry} />;
  }

  // a lista já diz quais não têm dados; as respostas com os arquivos dizem o mesmo se a coleta mudou no meio
  if (withoutData.length === repositories.length || comparison?.length === 0) {
    const message = getComparisonMissingDataMessage(repositories, metric, terms);
    return (
      <DashboardCard
        title={title}
        status="empty"
        badgeLabel={NO_FILE_DATA_BADGE}
        emptyTitle={message.title}
        emptyDescription={message.description}
        emptyAction={<CollectionGuideLink />}
      />
    );
  }

  if (isLoading || !option) {
    return <DashboardCard title={title} status="loading" loadingContent={<ChartSkeleton />} />;
  }

  return (
    <DashboardCard
      title={title}
      status="ready"
      headerAction={
        <Box sx={{ backgroundColor: DASHBOARD_COLORS.infoBackground, borderRadius: '12px', padding: '4px 10px' }}>
          <Typography fontWeight="bold" fontSize="12px" color={DASHBOARD_COLORS.primary}>
            Um boxplot por {terms.repository}
          </Typography>
        </Box>
      }
    >
      <DistributionChart option={option} height={COMPARISON_CHART_HEIGHT} />
      <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
        Cada caixa vai do 1º ao 3º quartil, com a mediana em destaque. Os pontos laranja são outliers. Arquivos com
        ncloc = 0 ficam fora.
      </Typography>
      {reference && (
        <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
          Linhas tracejadas: mínimo e máximo de referência da medida {reference.measureName} na release.
        </Typography>
      )}
      {withoutData.length > 0 && (
        <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
          Sem {metric} por arquivo nesta release: {withoutData.join(', ')}.
        </Typography>
      )}
    </DashboardCard>
  );
}
