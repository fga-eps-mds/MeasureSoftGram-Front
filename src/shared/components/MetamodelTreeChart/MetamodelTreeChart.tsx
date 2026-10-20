import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, Typography, Paper } from '@mui/material';
import { QualityModelNode } from '@customTypes/metamodel';
import {
  buildEChartsTreeOption,
  countMetricOccurrences,
  enrichTreeNodes,
  EnrichedQualityModelNode,
  METAMODEL_COLORS,
} from './formatMetamodelTree';
import { MetamodelNodeModal } from './MetamodelNodeModal';

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const MODAL_WIDTH = 360;

export interface MetamodelTreeChartProps {
  treeData: QualityModelNode | null;
  onPerformanceMeasured?: (durationMs: number) => void;
  height?: string | number;
}

export const MetamodelTreeChart: React.FC<MetamodelTreeChartProps> = ({
  treeData,
  onPerformanceMeasured,
  height = '720px',
}) => {
  const echartsRef = useRef<any>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [renderMs, setRenderMs] = useState<number | undefined>();
  const [selectedNode, setSelectedNode] = useState<EnrichedQualityModelNode | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);

  // Performance measurement (CA8)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.performance?.mark === 'function' && treeData) {
      try {
        window.performance.mark('metamodelo-render-start');
      } catch (e) {
        // ignora se a marcação não for suportada
      }
    }
  }, [treeData]);

  const handleChartFinished = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.performance?.getEntriesByName === 'function' &&
      typeof window.performance?.mark === 'function'
    ) {
      try {
        const startMarks = window.performance.getEntriesByName('metamodelo-render-start');
        if (startMarks.length > 0) {
          window.performance.mark('metamodelo-render-end');
          if (typeof window.performance.measure === 'function') {
            window.performance.measure(
              'metamodelo-render-time',
              'metamodelo-render-start',
              'metamodelo-render-end'
            );
            const measures = window.performance.getEntriesByName('metamodelo-render-time');
            const lastMeasure = measures[measures.length - 1];
            if (lastMeasure) {
              const duration = Math.round(lastMeasure.duration);
              setRenderMs(duration);
              if (onPerformanceMeasured) {
                onPerformanceMeasured(duration);
              }
            }
          }
          if (typeof window.performance.clearMarks === 'function') {
            window.performance.clearMarks('metamodelo-render-start');
            window.performance.clearMarks('metamodelo-render-end');
          }
        }
      } catch (e) {
        // ignora erro de medição
      }
    }
  }, [onPerformanceMeasured]);

  // Enriquece a árvore
  const enrichedTree = useMemo(() => {
    if (!treeData) return null;
    const metricCounts = countMetricOccurrences(treeData);
    const forceCollapseDepth = isAllExpanded ? -1 : 2;
    return enrichTreeNodes(treeData, metricCounts, '', 0, forceCollapseDepth);
  }, [treeData, isAllExpanded]);

  const chartOptions = useMemo(() => {
    return buildEChartsTreeOption(enrichedTree);
  }, [enrichedTree]);

  // Clicar em qualquer nó abre o card com a descrição (CA3), perto do nó e dentro da área do gráfico.
  const handleNodeClick = (params: any) => {
    if (!params?.data) return;
    setSelectedNode(params.data as EnrichedQualityModelNode);

    const { offsetX, offsetY } = params.event ?? {};
    if (typeof offsetX !== 'number' || typeof offsetY !== 'number') {
      setModalPosition(null);
      return;
    }
    const areaWidth = chartAreaRef.current?.clientWidth ?? 0;
    const x = areaWidth ? Math.max(10, Math.min(offsetX + 20, areaWidth - MODAL_WIDTH - 10)) : offsetX + 20;
    setModalPosition({ x, y: Math.max(10, offsetY - 40) });
  };

  const onEvents = useMemo(
    () => ({
      finished: handleChartFinished,
      click: handleNodeClick,
    }),
    [handleChartFinished]
  );

  const toggleExpandAll = () => {
    setIsAllExpanded((prev) => !prev);
    if (typeof window !== 'undefined' && typeof window.performance?.mark === 'function') {
      window.performance.mark('metamodelo-render-start');
    }
  };

  if (!treeData) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Barra de Ações e Legenda */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={2}
      >
        {/* Legenda visual dos tipos de entidades */}
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '2px',
                backgroundColor: METAMODEL_COLORS.tsqmi,
              }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              TSQMI
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography color={METAMODEL_COLORS.characteristic} fontSize={14}>
              ●
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Característica
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography color={METAMODEL_COLORS.subcharacteristic} fontSize={14}>
              ■
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Subcaracterística
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography color={METAMODEL_COLORS.measure} fontSize={14}>
              ◆
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Medida
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography color={METAMODEL_COLORS.metric} fontSize={12}>
              ▲
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Métrica
            </Typography>
          </Box>
        </Box>

        {/* Instrução de clique e botão Expandir / Recolher */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
            Peso (%) em relação ao nível acima · clique em &apos;+&apos; para abrir um ramo
          </Typography>

          <Button
            variant="outlined"
            size="small"
            onClick={toggleExpandAll}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              borderColor: '#CBD5E1',
              color: '#334155',
              fontWeight: 500,
              fontSize: '13px',
              py: '4px',
              px: '12px',
              '&:hover': {
                borderColor: '#94A3B8',
                backgroundColor: '#F8FAFC',
              },
            }}
          >
            {isAllExpanded ? 'Recolher tudo' : 'Expandir tudo'}
          </Button>
        </Box>
      </Box>

      {/* Área da árvore ECharts */}
      <Box
        ref={chartAreaRef}
        data-testid="metamodel-chart-area"
        data-render-ms={renderMs}
        sx={{
          width: '100%',
          height,
          border: '1px solid #F1F5F9',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <ReactEcharts
          ref={echartsRef}
          option={chartOptions}
          onEvents={onEvents}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Card detalhado do nó clicado, posicionado em relação à área do gráfico */}
        {selectedNode && (
          <MetamodelNodeModal
            node={selectedNode}
            position={modalPosition}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </Box>
    </Box>
  );
};

export default MetamodelTreeChart;
