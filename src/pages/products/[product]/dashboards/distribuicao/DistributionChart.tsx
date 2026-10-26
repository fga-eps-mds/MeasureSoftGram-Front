import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactEcharts from '@components/ECharts';
import { Box } from '@mui/material';

interface DistributionChartProps {
  /** Options do ECharts; memoize no componente pai, senão cada render vira um desenho novo. */
  option: object;
  height: number;
}

/**
 * Gráfico do dashboard que mede o tempo de desenho (diretriz de desempenho do épico #92): da option nova até o
 * ECharts terminar de desenhar, em data-render-ms. Com animation: false o primeiro desenho termina dentro do
 * setOption, antes de o echarts-for-react ligar os eventos, por isso ele vem do onChartReady; os seguintes vêm do
 * evento 'finished'.
 */
export default function DistributionChart({ option, height }: DistributionChartProps) {
  // o relógio começa quando a option nova chega, ainda no render, antes de o ECharts desenhar
  const optionCreatedAt = useMemo(() => performance.now(), [option]);
  const latestCreatedAt = useRef(optionCreatedAt);
  latestCreatedAt.current = optionCreatedAt;
  const measuredAt = useRef<number | null>(null);
  const [renderMs, setRenderMs] = useState<number>();

  // handler estável: o echarts-for-react guarda o onChartReady e o onEvents antes de terminar o init
  const handleDrawn = useCallback(() => {
    const createdAt = latestCreatedAt.current;
    // o 'finished' volta a disparar a cada hover: só o primeiro desenho de cada option conta
    if (measuredAt.current === createdAt) return;
    measuredAt.current = createdAt;
    setRenderMs(Math.round(performance.now() - createdAt));
  }, []);

  const onEvents = useMemo(() => ({ finished: handleDrawn }), [handleDrawn]);

  return (
    <Box data-testid="distribution-chart" data-render-ms={renderMs} width="100%">
      <ReactEcharts
        option={option}
        notMerge
        onChartReady={handleDrawn}
        onEvents={onEvents}
        style={{ height, width: '100%' }}
      />
    </Box>
  );
}
