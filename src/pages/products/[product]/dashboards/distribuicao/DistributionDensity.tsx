import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import { DistributionEntity } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { buildDensity, MIN_ANALYSES_FOR_DENSITY } from '@utils/distributionDensity';
import { buildHistogram } from '@utils/distributionHistogram';
import { formatAnalysisCount } from '@utils/distributionSummary';
import { formatDensityOptions, HISTOGRAM_CHART_HEIGHT } from '@utils/formatDistributionCharts';
import DistributionChart from './DistributionChart';

export const DENSITY_TITLE = 'Curva de densidade';

/** Por que não há curva (CA9): poucas análises ou todas com o mesmo valor. */
function getMissingDensity(count: number) {
  if (count < MIN_ANALYSES_FOR_DENSITY) {
    return {
      title: 'Faltam análises para a curva de densidade',
      description: `A curva precisa de pelo menos ${MIN_ANALYSES_FOR_DENSITY} análises, e o período tem ${formatAnalysisCount(
        count
      )}. O histograma e o resumo continuam valendo.`
    };
  }
  return {
    title: 'Faltam análises com valores diferentes para a curva',
    description: `As ${formatAnalysisCount(
      count
    )} do período têm o mesmo valor, e a curva precisa de valores diferentes para mostrar a forma da distribuição.`
  };
}

/** Forma da distribuição das análises (CA5), no mesmo eixo do histograma, com a linha da mediana. */
export default function DistributionDensity({ entity }: { entity: DistributionEntity }) {
  const { histogram, points } = useMemo(() => {
    const values = entity.analyses.map((analysis) => analysis.value);
    const axis = buildHistogram(values, entity.level, entity.metric_type);
    return {
      histogram: axis,
      points: buildDensity(values, { min: axis.min, max: axis.max, iqr: entity.summary.iqr })
    };
  }, [entity]);
  const option = useMemo(
    () => points && formatDensityOptions(points, histogram, entity.summary.median, entity.name),
    [points, histogram, entity.summary.median, entity.name]
  );

  if (!option) {
    const missing = getMissingDensity(entity.analyses.length);
    return (
      <DashboardCard
        title={DENSITY_TITLE}
        status="empty"
        badgeLabel="Poucas análises"
        emptyTitle={missing.title}
        emptyDescription={missing.description}
      />
    );
  }

  return (
    <DashboardCard title={DENSITY_TITLE} status="ready">
      <DistributionChart option={option} height={HISTOGRAM_CHART_HEIGHT} />
      <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
        A área sob a curva soma 1: quanto mais alta a curva num trecho, mais análises se concentram nele. A linha
        tracejada marca a mediana.
      </Typography>
    </DashboardCard>
  );
}
