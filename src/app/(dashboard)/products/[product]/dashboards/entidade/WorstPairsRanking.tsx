import React from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { formatDelta, formatScore, MatrixPair } from '@utils/entityMatrix';
import { getQualityBand } from '@utils/qualityBands';
import { IMPROVEMENT_COLOR, WORSENING_COLOR } from './ContributionChart';
import { EntityKey } from './EntityHeatmap';

const MONOSPACE = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/**
 * "Ranking dos piores pares" (CA6): do menor valor para o maior, com o grau e a variação em relação à release anterior
 * ("—" na primeira release).
 */
export default function WorstPairsRanking({ pairs }: { pairs: MatrixPair[] }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Ranking dos piores pares">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: DASHBOARD_COLORS.mutedText }}>#</TableCell>
            <TableCell sx={{ color: DASHBOARD_COLORS.mutedText }}>Repositório · entidade</TableCell>
            <TableCell align="right" sx={{ color: DASHBOARD_COLORS.mutedText }}>
              Valor
            </TableCell>
            <TableCell align="right" sx={{ color: DASHBOARD_COLORS.mutedText }}>
              Δ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pairs.map((pair, index) => {
            const value = pair.value as number;
            const band = getQualityBand(value);
            const delta = formatDelta(value, pair.previousValue);
            // "0,00" e "—" ficam neutros
            let deltaColor = DASHBOARD_COLORS.mutedText;
            if (delta.startsWith('−')) deltaColor = WORSENING_COLOR;
            if (delta.startsWith('+')) deltaColor = IMPROVEMENT_COLOR;
            return (
              <TableRow key={`${pair.repository.id}:${pair.column.key}`}>
                <TableCell sx={{ color: DASHBOARD_COLORS.mutedText }}>{index + 1}</TableCell>
                <TableCell>
                  <Typography fontSize="14px" fontWeight="bold" color={DASHBOARD_COLORS.text}>
                    {pair.repository.name}
                  </Typography>
                  <Typography
                    fontSize="12px"
                    fontFamily={MONOSPACE}
                    color={DASHBOARD_COLORS.mutedText}
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    <EntityKey value={pair.column.key} />
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: band?.color,
                      color: band?.grade === 'E' ? '#FFFFFF' : DASHBOARD_COLORS.text,
                      fontFamily: MONOSPACE,
                      fontWeight: 'bold',
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatScore(value)} {band?.grade}
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: MONOSPACE, fontWeight: 'bold', color: deltaColor }}>
                  {delta}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
