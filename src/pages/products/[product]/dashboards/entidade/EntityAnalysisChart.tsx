import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { EntityAnalysis, EntityAnalysisRepository } from '@customTypes/product';
import { formatEntityAnalysisChartOptions } from '@utils/formatEntityAnalysisChart';

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const BAR_HEIGHT = 44;
const MIN_HEIGHT = 200;

interface Props {
  analysis: EntityAnalysis;
  showReference: boolean;
  onSelectRepository: (repository: EntityAnalysisRepository) => void;
}

/**
 * Barras horizontais, uma por repositório. Mede o tempo entre a chegada dos dados e o fim do
 * desenho (diretriz do épico: menos de 1 s) e o expõe em `data-render-ms`.
 */
export default function EntityAnalysisChart({ analysis, showReference, onSelectRepository }: Props) {
  const options = useMemo(() => formatEntityAnalysisChartOptions(analysis, showReference), [analysis, showReference]);
  const drawStartedAt = useRef<number | null>(null);
  const [renderMs, setRenderMs] = useState<number | null>(null);

  useEffect(() => {
    drawStartedAt.current = performance.now();
    setRenderMs(null);
  }, [analysis]);

  const onEvents = useMemo(
    () => ({
      click: (params: { data?: { repositoryId?: number } }) => {
        const repository = analysis.repositories.find((item) => item.id === params.data?.repositoryId);
        if (repository) onSelectRepository(repository);
      },
      finished: () => {
        if (drawStartedAt.current === null) return;
        setRenderMs(Math.round(performance.now() - drawStartedAt.current));
        drawStartedAt.current = null;
      },
    }),
    [analysis, onSelectRepository]
  );

  const height = Math.max(MIN_HEIGHT, analysis.repositories.length * BAR_HEIGHT + 48);

  return (
    <Box data-testid="entity-analysis-chart" data-render-ms={renderMs ?? undefined} width="100%">
      <ReactEcharts option={options} onEvents={onEvents} notMerge style={{ height, width: '100%' }} />
    </Box>
  );
}
