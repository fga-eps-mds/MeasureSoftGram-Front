import React from 'react';
import { Box, Typography } from '@mui/material';
import { QUALITY_BANDS, formatQualityBandRange } from '@utils/qualityBands';

/**
 * Legenda das faixas A a E do indicador (US06.01), a mesma em todos os gráficos de pulso: da pior para a melhor, com
 * marcadores circulares, como no protótipo.
 */
export function QualityLegend() {
  return (
    <Box display="flex" alignItems="center" columnGap={2} rowGap={0.5} flexWrap="wrap">
      {QUALITY_BANDS.map((band) => (
        <Box key={band.grade} display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: band.color }} />
          <Typography variant="caption" color="text.secondary">
            {band.grade} · {band.label} ({formatQualityBandRange(band)})
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default QualityLegend;
