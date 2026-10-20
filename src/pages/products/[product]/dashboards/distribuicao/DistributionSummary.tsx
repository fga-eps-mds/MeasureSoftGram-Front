import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import { MetricDistributionSummary } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { COLOR_TOKENS } from '@utils/formatPulseChart';
import { formatExcludedFiles, getSummaryRows, MetricKind } from '@utils/metricDistribution';

interface DistributionSummaryProps {
  summary: MetricDistributionSummary;
  kind: MetricKind;
  outlierCount: number;
  excludedFiles: number;
}

/** Quadro de resumo do protótipo (CA3), com o aviso dos arquivos sem linhas de código (CA7). */
export default function DistributionSummary({ summary, kind, outlierCount, excludedFiles }: DistributionSummaryProps) {
  return (
    <DashboardCard title="Resumo" status="ready">
      <Box component="dl" display="flex" flexDirection="column" gap="10px" margin={0}>
        {getSummaryRows(summary, kind, outlierCount).map((row) => (
          <Box key={row.label} data-testid="summary-row" display="flex" justifyContent="space-between" gap="12px">
            <Typography component="dt" fontSize="13px" color={DASHBOARD_COLORS.text}>
              {row.label}
            </Typography>
            <Typography component="dd" fontSize="13px" fontWeight="bold" color={DASHBOARD_COLORS.text} margin={0}>
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ backgroundColor: COLOR_TOKENS.bgEven, borderRadius: '6px', padding: '10px 12px' }}>
        <Typography fontSize="12px" fontWeight="bold" color={DASHBOARD_COLORS.text}>
          {formatExcludedFiles(excludedFiles)}
        </Typography>
        <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
          Arquivos sem linhas de código (ncloc = 0) ficam fora, como no cálculo das medidas.
        </Typography>
      </Box>
    </DashboardCard>
  );
}
