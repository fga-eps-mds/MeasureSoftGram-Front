import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import { DistributionEntity } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { buildHistogram } from '@utils/distributionHistogram';
import { formatScatterOptions, SCATTER_CHART_HEIGHT } from '@utils/formatDistributionCharts';
import DistributionChart from './DistributionChart';

export const SCATTER_TITLE = 'Dispersão das análises no tempo';

/** Um ponto por análise na data dela, com a faixa do Q1 ao Q3, a mediana e os discrepantes (CA7). */
export default function DistributionScatter({ entity }: { entity: DistributionEntity }) {
  const option = useMemo(() => {
    // o eixo y é o mesmo eixo de valores do histograma: 0 a 1, ou a escala da métrica
    const histogram = buildHistogram(
      entity.analyses.map((analysis) => analysis.value),
      entity.level,
      entity.metric_type
    );
    return formatScatterOptions(entity, histogram);
  }, [entity]);

  return (
    <DashboardCard title={SCATTER_TITLE} status="ready">
      <DistributionChart option={option} height={SCATTER_CHART_HEIGHT} />
      <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
        Cada ponto é uma análise, na data em que foi feita. A faixa clara vai do Q1 ao Q3, onde ficam as 50% análises do
        meio, e a linha tracejada marca a mediana.
      </Typography>
    </DashboardCard>
  );
}
