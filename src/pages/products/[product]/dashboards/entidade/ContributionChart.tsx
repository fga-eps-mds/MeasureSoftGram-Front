import React from 'react';
import { Box, Typography } from '@mui/material';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { formatContribution, MatrixPair } from '@utils/entityMatrix';

export const WORSENING_COLOR = '#B42318';
export const IMPROVEMENT_COLOR = '#1F6FB2';

const MONOSPACE = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/**
 * "O que puxa a qualidade total para baixo" (CA5): barras divergentes a partir do zero, da maior piora para a maior
 * melhora, com a piora à esquerda em vermelho e a melhora à direita em azul.
 */
export default function ContributionChart({ pairs }: { pairs: MatrixPair[] }) {
  const largest = Math.max(...pairs.map((pair) => Math.abs(pair.contribution as number)));

  return (
    <Box display="flex" flexDirection="column" gap="12px" data-testid="contribution-chart">
      {pairs.map((pair) => {
        const contribution = pair.contribution as number;
        const isWorsening = contribution < 0;
        const width = `${(Math.abs(contribution) / largest) * 100}%`;
        const color = isWorsening ? WORSENING_COLOR : IMPROVEMENT_COLOR;
        return (
          <Box
            key={`${pair.repository.id}:${pair.column.key}`}
            data-testid="contribution-row"
            display="grid"
            gridTemplateColumns="minmax(110px, 1.2fr) minmax(0, 2fr) 64px"
            alignItems="center"
            gap="12px"
          >
            <Box minWidth={0}>
              <Typography fontSize="13px" fontWeight="bold" color={DASHBOARD_COLORS.text} noWrap>
                {pair.repository.name}
              </Typography>
              <Typography fontSize="11px" fontFamily={MONOSPACE} color={DASHBOARD_COLORS.mutedText} noWrap>
                {pair.column.key}
              </Typography>
            </Box>
            <Box display="grid" gridTemplateColumns="1fr 1fr" height={16} aria-hidden>
              <Box display="flex" justifyContent="flex-end" borderRight={`1px solid ${DASHBOARD_COLORS.cardBorder}`}>
                {isWorsening && <Box sx={{ width, backgroundColor: color, borderRadius: '2px 0 0 2px' }} />}
              </Box>
              <Box display="flex">
                {!isWorsening && <Box sx={{ width, backgroundColor: color, borderRadius: '0 2px 2px 0' }} />}
              </Box>
            </Box>
            <Typography fontSize="13px" fontFamily={MONOSPACE} fontWeight="bold" color={color} textAlign="right">
              {formatContribution(contribution)}
            </Typography>
          </Box>
        );
      })}
      <Box display="grid" gridTemplateColumns="minmax(110px, 1.2fr) minmax(0, 2fr) 64px" gap="12px" aria-hidden>
        <span />
        <Box display="flex" justifyContent="space-around">
          <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
            ← piora
          </Typography>
          <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
            melhora →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
