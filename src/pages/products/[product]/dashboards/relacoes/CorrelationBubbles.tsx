import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import { RepositoryCorrelation } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { formatStatistic } from '@utils/distributionSummary';
import { CORRELATION_COLORS, formatCorrelationBubbleOptions } from '@utils/formatCorrelationCharts';
import CorrelationChart from './CorrelationChart';

export const BUBBLES_TITLE = 'Matriz de bolhas das correlações';

const LEGEND_SIZES = [0.25, 0.5, 0.75, 1];
/** Diâmetro, em px, do maior círculo da legenda de tamanhos. */
const LEGEND_MAX_SIZE = 40;

const COLOR_ITEMS = [
  { label: 'Positiva', swatch: { backgroundColor: CORRELATION_COLORS.bubble } },
  { label: 'Negativa', swatch: { backgroundColor: CORRELATION_COLORS.negative } },
  { label: 'Não tem relação', swatch: { backgroundColor: '#FFFFFF', border: `2px solid ${CORRELATION_COLORS.bubble}` } }
];

function BubbleLegend() {
  return (
    <Box display="flex" flexDirection="column" gap="10px">
      <Box
        component="ul"
        display="flex"
        flexWrap="wrap"
        gap="4px 16px"
        margin={0}
        padding={0}
        sx={{ listStyle: 'none' }}
      >
        {COLOR_ITEMS.map((item) => (
          <Box component="li" key={item.label} display="flex" alignItems="center" gap="6px">
            <Box aria-hidden width={12} height={12} borderRadius="50%" boxSizing="border-box" sx={item.swatch} />
            <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex" alignItems="center" flexWrap="wrap" gap="12px">
        <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
          Tamanho = |r|:
        </Typography>
        {LEGEND_SIZES.map((size) => (
          <Box key={size} display="flex" alignItems="center" gap="6px">
            <Box
              aria-hidden
              width={size * LEGEND_MAX_SIZE}
              height={size * LEGEND_MAX_SIZE}
              borderRadius="50%"
              sx={{ backgroundColor: DASHBOARD_COLORS.cardBorder }}
            />
            <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
              {formatStatistic(size)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Matriz de bolhas (CA5): a mesma RD_Corr, no mesmo formato; o tamanho do círculo é |r|, a cor é o sinal e o
 * coeficiente não significativo fica em círculo vazado.
 */
export default function CorrelationBubbles({ correlation }: { correlation: RepositoryCorrelation }) {
  const option = useMemo(() => formatCorrelationBubbleOptions(correlation), [correlation]);

  return (
    <DashboardCard title={BUBBLES_TITLE} status="ready">
      <Typography fontSize="13px" color={DASHBOARD_COLORS.text}>
        A mesma matriz RD_Corr de {correlation.repository.name}: o tamanho do círculo é |r| e a cor é o sinal da
        correlação. Os nomes ficam na diagonal, como na matriz ao lado.
      </Typography>
      <CorrelationChart option={option} entities={correlation.entities.length} />
      <BubbleLegend />
    </DashboardCard>
  );
}
