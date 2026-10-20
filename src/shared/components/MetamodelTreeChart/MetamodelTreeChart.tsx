import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, Typography, Paper } from '@mui/material';
import { QualityModelNode } from '@customTypes/metamodel';
import {
  buildEChartsTreeOption,
  collectExpandablePaths,
  countMetricOccurrences,
  enrichTreeNodes,
  EnrichedQualityModelNode,
  getTreeLayoutSize,
  METAMODEL_COLORS,
} from './formatMetamodelTree';
import { MetamodelNodeModal } from './MetamodelNodeModal';

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const MODAL_WIDTH = 360;
// ramos abertos por padrão: TSQMI e características
const DEFAULT_EXPANDED_DEPTH = 2;

export interface MetamodelTreeChartProps {
  treeData: QualityModelNode | null;
  onPerformanceMeasured?: (durationMs: number) => void;
  /** Altura mínima da área; com mais ramos abertos ela cresce para os cards não se sobreporem. */
  minHeight?: number;
}

export const MetamodelTreeChart: React.FC<MetamodelTreeChartProps> = ({
  treeData,
  onPerformanceMeasured,
  minHeight = 720,
}) => {
  const echartsRef = useRef<any>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  // ramos abertos pelo usuário; null enquanto vale o padrão
  const [expandedPaths, setExpandedPaths] = useState<ReadonlySet<string> | null>(null);
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

  // outra release traz outra árvore, que abre no padrão
  useEffect(() => {
    setExpandedPaths(null);
    setIsAllExpanded(false);
  }, [treeData]);

  const visibleExpandedPaths = useMemo(() => {
    if (expandedPaths) return expandedPaths;
    if (!treeData) return new Set<string>();
    return collectExpandablePaths(treeData, isAllExpanded ? Infinity : DEFAULT_EXPANDED_DEPTH);
  }, [expandedPaths, treeData, isAllExpanded]);

  // Enriquece a árvore
  const enrichedTree = useMemo(() => {
    if (!treeData) return null;
    const metricCounts = countMetricOccurrences(treeData);
    return enrichTreeNodes(treeData, metricCounts, '', 0, undefined, visibleExpandedPaths);
  }, [treeData, visibleExpandedPaths]);

  const chartOptions = useMemo(() => {
    return buildEChartsTreeOption(enrichedTree);
  }, [enrichedTree]);

  // a área acompanha os ramos abertos; o que passar da largura do card rola na horizontal
  const layoutSize = useMemo(() => (enrichedTree ? getTreeLayoutSize(enrichedTree) : null), [enrichedTree]);

  // Clicar em qualquer nó abre o card com a descrição (CA3), perto do nó e dentro da área do gráfico.
  const handleNodeClick = useCallback((params: any) => {
    if (!params?.data) return;
    const node = params.data as EnrichedQualityModelNode;
    setSelectedNode(node);

    // o ECharts abre ou fecha o ramo; o estado acompanha para a área ter o tamanho certo
    const { nodePath } = node;
    if (nodePath && node.children?.length) {
      setExpandedPaths((current) => {
        const next = new Set(current ?? visibleExpandedPaths);
        if (next.has(nodePath)) next.delete(nodePath);
        else next.add(nodePath);
        return next;
      });
    }

    const { offsetX, offsetY } = params.event ?? {};
    if (typeof offsetX !== 'number' || typeof offsetY !== 'number') {
      setModalPosition(null);
      return;
    }
    const areaWidth = chartAreaRef.current?.clientWidth ?? 0;
    const x = areaWidth ? Math.max(10, Math.min(offsetX + 20, areaWidth - MODAL_WIDTH - 10)) : offsetX + 20;
    setModalPosition({ x, y: Math.max(10, offsetY - 40) });
  }, [visibleExpandedPaths]);

  const onEvents = useMemo(
    () => ({
      finished: handleChartFinished,
      click: handleNodeClick,
    }),
    [handleChartFinished, handleNodeClick]
  );

  const toggleExpandAll = () => {
    setIsAllExpanded((prev) => !prev);
    setExpandedPaths(null);
    if (typeof window !== 'undefined' && typeof window.performance?.mark === 'function') {
      window.performance.mark('metamodelo-render-start');
    }
  };

  if (!treeData) return null;

  return (
    // grid com coluna minmax(0, 1fr): a árvore larga rola dentro do card em vez de alargar a página
    <Box sx={{ position: 'relative', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>
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
        sx={{
          width: '100%',
          border: '1px solid #F1F5F9',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <Box
          ref={chartAreaRef}
          data-testid="metamodel-chart-area"
          data-render-ms={renderMs}
          sx={{
            width: '100%',
            minWidth: layoutSize?.width,
            height: Math.max(minHeight, layoutSize?.height ?? 0),
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
    </Box>
  );
};

export default MetamodelTreeChart;
