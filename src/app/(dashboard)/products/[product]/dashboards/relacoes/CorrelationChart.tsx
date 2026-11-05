import React from 'react';
import { Box } from '@mui/material';
import { getCorrelationChartSize } from '@utils/formatCorrelationCharts';
import DistributionChart from '../distribuicao/DistributionChart';

/**
 * Matriz com células de tamanho fixo. Em tela estreita, o gráfico mantém a largura das células e dos nomes e rola na
 * horizontal, sem a página rolar junto. Usa o gráfico da Distribuição, que mede o tempo de desenho.
 */
export default function CorrelationChart({ option, entities }: { option: object; entities: number }) {
  const size = getCorrelationChartSize(entities);

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box minWidth={size.width}>
        <DistributionChart option={option} height={size.height} />
      </Box>
    </Box>
  );
}
