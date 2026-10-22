import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import { DistributionSummary as Summary } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { describeSkewness, getSkewnessWarning, getSummaryRows } from '@utils/distributionSummary';
import { COLOR_TOKENS } from '@utils/formatPulseChart';

export const SUMMARY_TITLE = 'Resumo estatístico e IQR';

/** Resumo estatístico das análises (CA8), com a nota sobre o IQR, os discrepantes e a assimetria. */
export default function DistributionSummary({ summary }: { summary: Summary }) {
  const warning = getSkewnessWarning(summary);
  const skewness = describeSkewness(summary.skewness);

  return (
    <DashboardCard title={SUMMARY_TITLE} status="ready">
      <Box component="dl" display="flex" flexDirection="column" gap="4px" margin={0}>
        {getSummaryRows(summary).map((row) => (
          <Box
            key={row.label}
            data-testid="summary-row"
            data-highlight={row.highlight ? 'true' : undefined}
            display="flex"
            justifyContent="space-between"
            gap="12px"
            sx={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: row.highlight ? DASHBOARD_COLORS.infoBackground : undefined
            }}
          >
            <Typography
              component="dt"
              fontSize="13px"
              fontWeight={row.highlight ? 'bold' : undefined}
              color={row.highlight ? DASHBOARD_COLORS.primary : DASHBOARD_COLORS.text}
            >
              {row.label}
            </Typography>
            <Typography
              component="dd"
              fontSize="13px"
              fontWeight="bold"
              color={row.highlight ? DASHBOARD_COLORS.primary : DASHBOARD_COLORS.text}
              margin={0}
            >
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {warning && (
        <Typography data-testid="skewness-warning" fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
          {warning}
        </Typography>
      )}

      <Box
        data-testid="summary-note"
        sx={{ backgroundColor: COLOR_TOKENS.bgEven, borderRadius: '6px', padding: '10px 12px' }}
      >
        <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
          O IQR é a distância entre o Q3 e o Q1, onde ficam as 50% análises do meio. Discrepantes são as análises fora
          dos limites: abaixo de Q1 − 1,5 × IQR ou acima de Q3 + 1,5 × IQR.
        </Typography>
        <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText} marginTop="6px">
          {skewness ??
            'Assimetria positiva: a cauda longa fica à direita (valores altos isolados). Negativa: à esquerda (valores baixos isolados).'}
        </Typography>
      </Box>
    </DashboardCard>
  );
}
