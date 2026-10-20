import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { FileMetricKey, MetricDistributionRepository } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { DISTRIBUTION_CHART_HEIGHT, formatDistributionChartOptions } from '@utils/formatDistributionCharts';
import { getBoxplotStats, getFileMetric, getMissingDataMessage, MetricReference } from '@utils/metricDistribution';
import DistributionChart from './DistributionChart';
import DistributionSummary from './DistributionSummary';
import { ChartSkeleton, CollectionGuideLink, DistributionErrorCard, NO_FILE_DATA_BADGE } from './DistributionStates';

interface RepositoryDistributionProps {
  metric: FileMetricKey;
  /** Repositório escolhido, como vem na lista da release: com o resumo e sem os arquivos. */
  repository: MetricDistributionRepository;
  /** O mesmo repositório com os arquivos, quando já carregou. */
  detail?: MetricDistributionRepository;
  reference: MetricReference | null;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

/** Histograma e boxplot de um repositório no mesmo eixo, com o quadro de resumo (CA3, CA4, CA5 e CA7). */
export default function RepositoryDistribution({
  metric,
  repository,
  detail,
  reference,
  isLoading,
  error,
  onRetry
}: RepositoryDistributionProps) {
  const { terms } = useProviderTerms();
  const { kind } = getFileMetric(metric);
  const summary = detail?.summary;
  const files = detail?.files;
  const stats = useMemo(() => (summary ? getBoxplotStats(summary, files ?? []) : undefined), [summary, files]);
  const option = useMemo(
    () => (stats ? formatDistributionChartOptions({ metric, files: files ?? [], stats, reference }) : undefined),
    [metric, files, stats, reference]
  );
  const title = `Distribuição de ${metric} entre os arquivos · ${repository.repository_name}`;

  if (!repository.summary || (detail && !summary)) {
    // a resposta com os arquivos, quando já chegou, é o retrato mais novo da coleta
    const message = getMissingDataMessage(detail ?? repository, metric, terms);
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

  if (error) {
    return <DistributionErrorCard onRetry={onRetry} />;
  }

  if (isLoading || !summary || !stats || !option) {
    return <DashboardCard title={title} status="loading" loadingContent={<ChartSkeleton />} />;
  }

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: 'minmax(0, 1fr) 300px' }} gap="24px" alignItems="start">
      <DashboardCard title={title} status="ready">
        <DistributionChart option={option} height={DISTRIBUTION_CHART_HEIGHT} />
        <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
          {stats.outliers.length
            ? 'Passe o mouse sobre um ponto laranja (outlier) para ver o arquivo.'
            : 'Nenhum arquivo fica a mais de 1,5 × a distância entre o 1º e o 3º quartil.'}
        </Typography>
      </DashboardCard>
      <DistributionSummary
        summary={summary}
        kind={kind}
        outlierCount={stats.outliers.length}
        excludedFiles={detail?.excluded_files ?? repository.excluded_files}
      />
    </Box>
  );
}
