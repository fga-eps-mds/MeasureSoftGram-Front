import { QualityModelNode } from '@customTypes/metamodel';

export const METAMODEL_COLORS = {
  tsqmi: '#234361',
  characteristic: '#1976D2',
  subcharacteristic: '#00838F',
  measure: '#E65100',
  metric: '#7B1FA2',
  line: '#CBD5E1',
  textDark: '#1E293B',
  textMuted: '#64748B',
  bgCard: '#FFFFFF',
};

export interface EnrichedQualityModelNode extends QualityModelNode {
  isSharedMetric?: boolean;
  parentPath?: string;
  parentWeightLabel?: string;
  children: EnrichedQualityModelNode[];
  collapsed?: boolean;
}

/**
 * Conta a ocorrência de cada métrica para marcar se é compartilhada entre múltiplas medidas.
 */
export function countMetricOccurrences(tree: QualityModelNode): Record<string, number> {
  const counts: Record<string, number> = {};

  function traverse(node: QualityModelNode) {
    if (node.type === 'metric') {
      const key = node.key || node.name;
      counts[key] = (counts[key] || 0) + 1;
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return counts;
}

/**
 * Enriquece os nós com caminhos hierárquicos, status de métrica compartilhada
 * e controle de colapso inicial (recolhido a partir de subcaracterísticas - depth >= 2).
 */
export function enrichTreeNodes(
  node: QualityModelNode,
  metricCounts: Record<string, number>,
  parentPath = '',
  depth = 0,
  forceCollapseDepth?: number
): EnrichedQualityModelNode {
  const isMetric = node.type === 'metric';
  const metricKey = node.key || node.name;
  const isSharedMetric = isMetric && (metricCounts[metricKey] || 0) > 1;

  const currentPath = parentPath ? `${parentPath} › ${node.name}` : node.name;

  let parentWeightLabel = 'Peso';
  if (node.type === 'characteristic') parentWeightLabel = 'Peso no TSQMI';
  else if (node.type === 'subcharacteristic') parentWeightLabel = 'Peso na característica';
  else if (node.type === 'measure') parentWeightLabel = 'Peso na subcaracterística';

  // Por padrão: depth 0 (tsqmi) e 1 (characteristic) abertos; depth >= 2 (subcharacteristic) recolhido
  // Se forceCollapseDepth for passado:
  // - forceCollapseDepth === -1: tudo expandido (collapsed = false)
  // - forceCollapseDepth === 2: recolhido até subcaracterísticas (depth >= 2 tem collapsed = true)
  const collapseThreshold = forceCollapseDepth !== undefined ? forceCollapseDepth : 2;
  const shouldCollapse = collapseThreshold === -1 ? false : depth >= collapseThreshold;

  const hasChildren = node.children && node.children.length > 0;

  return {
    ...node,
    isSharedMetric,
    parentPath,
    parentWeightLabel,
    collapsed: hasChildren && shouldCollapse ? true : false,
    children: (node.children || []).map((child) =>
      enrichTreeNodes(child, metricCounts, currentPath, depth + 1, forceCollapseDepth)
    ),
  };
}

/**
 * Formata os limites de referência de uma medida
 */
export function formatThresholdSummary(min?: number | null, max?: number | null): string {
  const hasMin = min !== undefined && min !== null;
  const hasMax = max !== undefined && max !== null;

  if (hasMin && hasMax) {
    return `mín. ${min} · máx. ${max}`;
  }
  if (hasMin) {
    return `mín. ${min}`;
  }
  if (hasMax) {
    return `máx. ${max}`;
  }
  return '';
}

/** Peso no rótulo do nó; sem peso na configuração, o rótulo fica sem ele em vez de mostrar 0%. */
export function formatWeightLabel(weight: number | null | undefined, style: string): string {
  return weight === null || weight === undefined ? '' : `  {${style}|· ${weight}%}`;
}

/**
 * Cria a estrutura de opções do ECharts para o gráfico series-tree.
 */
export function buildEChartsTreeOption(rootNode: EnrichedQualityModelNode | null) {
  if (!rootNode) {
    return {};
  }

  return {
    // a descrição aparece no card do clique (CA3), e não num tooltip ao passar o mouse
    tooltip: { show: false },
    series: [
      {
        type: 'tree',
        data: [rootNode],
        top: '40px',
        left: '80px',
        bottom: '40px',
        right: '180px',
        layout: 'orthogonal',
        orient: 'LR',
        symbol: 'emptyCircle',
        symbolSize: 1, // Não desenha círculos padrões para nós usarmos o label estilizado como card
        edgeShape: 'curve',
        edgeForkPosition: '60%',
        initialTreeDepth: 2,
        expandAndCollapse: true,
        animationDuration: 400,
        animationDurationUpdate: 300,
        lineStyle: {
          color: METAMODEL_COLORS.line,
          width: 1.5,
          curveness: 0.5,
        },
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left',
          distance: 0,
          formatter: (params: any) => {
            const node = params.data as EnrichedQualityModelNode;
            if (!node) return '';

            if (node.type === 'tsqmi') {
              return `{tsqmiCard| ${node.name} }`;
            }

            if (node.type === 'characteristic') {
              return `{charCard|{charBullet|●}  {charName|${node.name}}${formatWeightLabel(node.weight, 'weight')}}`;
            }

            if (node.type === 'subcharacteristic') {
              const numChildren = node.children ? node.children.length : 0;
              const isCollapsed =
                params.isExpand !== undefined ? !params.isExpand : Boolean(node.collapsed);
              const badge = isCollapsed
                ? `{subBadge|+ ${numChildren} ${numChildren === 1 ? 'medida' : 'medidas'}}`
                : `{subBadgeClose|−}`;

              return `{subCard|{subSquare|■}  {subName|${node.name}}${formatWeightLabel(node.weight, 'weight')}  ${badge}}`;
            }

            if (node.type === 'measure') {
              const ref = formatThresholdSummary(node.min_threshold, node.max_threshold);
              const refLine = ref ? `\n{measureRef|Ref. por arquivo: ${ref}}` : '';
              return `{measureCard|{measureDiamond|◆}  {measureName|${node.name}}${formatWeightLabel(node.weight, 'weightOrange')}${refLine}}`;
            }

            if (node.type === 'metric') {
              const sharedLine = node.isSharedMetric ? `\n{metricShared|também em outra medida}` : '';
              return `{metricCard|{metricTriangle|▲}  {metricName|${node.name || node.key}}${sharedLine}}`;
            }

            return node.name;
          },
          rich: {
            tsqmiCard: {
              backgroundColor: METAMODEL_COLORS.tsqmi,
              color: '#FFFFFF',
              borderRadius: 4,
              padding: [8, 14],
              fontWeight: 'bold',
              fontSize: 13,
              lineHeight: 18,
            },
            charCard: {
              backgroundColor: '#FFFFFF',
              borderColor: METAMODEL_COLORS.characteristic,
              borderWidth: 1.5,
              borderRadius: 6,
              padding: [6, 12],
              lineHeight: 20,
            },
            charBullet: {
              color: METAMODEL_COLORS.characteristic,
              fontSize: 13,
            },
            charName: {
              color: '#1E293B',
              fontWeight: 600,
              fontSize: 13,
            },
            weight: {
              color: '#2563EB',
              fontWeight: 600,
              fontSize: 12,
            },
            subCard: {
              backgroundColor: '#FFFFFF',
              borderColor: METAMODEL_COLORS.subcharacteristic,
              borderWidth: 1.5,
              borderRadius: 6,
              padding: [6, 12],
              lineHeight: 20,
            },
            subSquare: {
              color: METAMODEL_COLORS.subcharacteristic,
              fontSize: 12,
            },
            subName: {
              color: '#1E293B',
              fontWeight: 600,
              fontSize: 13,
            },
            subBadge: {
              backgroundColor: '#E0F2FE',
              color: '#0369A1',
              borderRadius: 4,
              padding: [2, 6],
              fontSize: 11,
              fontWeight: 600,
            },
            subBadgeClose: {
              backgroundColor: '#F1F5F9',
              color: '#475569',
              borderRadius: 4,
              padding: [2, 6],
              fontSize: 12,
              fontWeight: 700,
            },
            measureCard: {
              backgroundColor: '#FFFFFF',
              borderColor: METAMODEL_COLORS.measure,
              borderWidth: 1.5,
              borderRadius: 6,
              padding: [6, 12],
              lineHeight: 18,
            },
            measureDiamond: {
              color: METAMODEL_COLORS.measure,
              fontSize: 13,
            },
            measureName: {
              color: '#1E293B',
              fontWeight: 600,
              fontSize: 13,
            },
            weightOrange: {
              color: METAMODEL_COLORS.measure,
              fontWeight: 600,
              fontSize: 12,
            },
            measureRef: {
              color: '#64748B',
              fontSize: 11,
              padding: [4, 0, 0, 16],
            },
            metricCard: {
              backgroundColor: '#FFFFFF',
              borderColor: METAMODEL_COLORS.metric,
              borderWidth: 1.5,
              borderRadius: 6,
              padding: [6, 12],
              lineHeight: 18,
            },
            metricTriangle: {
              color: METAMODEL_COLORS.metric,
              fontSize: 11,
            },
            metricName: {
              color: '#1E293B',
              fontWeight: 500,
              fontSize: 12,
            },
            metricShared: {
              color: METAMODEL_COLORS.metric,
              fontSize: 10,
              padding: [2, 0, 0, 14],
            },
          },
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
          },
        },
      },
    ],
  };
}
