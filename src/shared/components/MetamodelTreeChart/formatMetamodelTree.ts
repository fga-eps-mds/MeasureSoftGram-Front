import { QualityModelNode, QualityModelNodeType } from '@customTypes/metamodel';

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
  /** Caminho do nó na árvore; identifica o ramo aberto ou fechado. */
  nodePath?: string;
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
 * Caminhos dos nós com filhos até `maxDepth` (exclusivo). Com `maxDepth = 2` são os ramos
 * abertos por padrão (TSQMI e características); sem ele, todos os ramos da árvore.
 */
export function collectExpandablePaths(
  node: QualityModelNode,
  maxDepth = Infinity,
  parentPath = '',
  depth = 0,
  paths: Set<string> = new Set()
): Set<string> {
  const currentPath = parentPath ? `${parentPath} › ${node.name}` : node.name;
  if (depth < maxDepth && node.children?.length) {
    paths.add(currentPath);
    node.children.forEach((child) => collectExpandablePaths(child, maxDepth, currentPath, depth + 1, paths));
  }
  return paths;
}

/**
 * Enriquece os nós com caminhos hierárquicos, status de métrica compartilhada
 * e controle de colapso inicial (recolhido a partir de subcaracterísticas - depth >= 2).
 * Com `expandedPaths`, ficam abertos exatamente os ramos dessa lista.
 */
export function enrichTreeNodes(
  node: QualityModelNode,
  metricCounts: Record<string, number>,
  parentPath = '',
  depth = 0,
  forceCollapseDepth?: number,
  expandedPaths?: ReadonlySet<string>
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
  const shouldCollapse = expandedPaths
    ? !expandedPaths.has(currentPath)
    : collapseThreshold !== -1 && depth >= collapseThreshold;

  const hasChildren = node.children && node.children.length > 0;

  return {
    ...node,
    isSharedMetric,
    parentPath,
    nodePath: currentPath,
    parentWeightLabel,
    collapsed: hasChildren && shouldCollapse ? true : false,
    children: (node.children || []).map((child) =>
      enrichTreeNodes(child, metricCounts, currentPath, depth + 1, forceCollapseDepth, expandedPaths)
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

const CARD_LABEL = {
  backgroundColor: METAMODEL_COLORS.bgCard,
  borderWidth: 1.5,
  borderRadius: 6,
  padding: [6, 12],
};

/**
 * Card de cada nível. Fica no rótulo do próprio nó porque o rich text do ECharts não aceita
 * um estilo dentro de outro: `{card|{marcador|●}}` sai como texto cru no gráfico.
 */
const NODE_LABEL_STYLE: Record<QualityModelNodeType, Record<string, unknown>> = {
  tsqmi: { backgroundColor: METAMODEL_COLORS.tsqmi, borderRadius: 4, padding: [8, 14], lineHeight: 18 },
  characteristic: { ...CARD_LABEL, borderColor: METAMODEL_COLORS.characteristic, lineHeight: 20 },
  subcharacteristic: { ...CARD_LABEL, borderColor: METAMODEL_COLORS.subcharacteristic, lineHeight: 20 },
  measure: { ...CARD_LABEL, borderColor: METAMODEL_COLORS.measure, lineHeight: 18 },
  metric: { ...CARD_LABEL, borderColor: METAMODEL_COLORS.metric, lineHeight: 18 },
};

// medidas da área da árvore: o ECharts espalha os níveis por igual na largura e as folhas na altura
const TREE_MARGIN = { top: 40, bottom: 40, left: 24, right: 16 };
const LEVEL_GAP = 48;
const ROW_HEIGHT = 44;
const TWO_LINE_ROW_HEIGHT = 58;
const CARD_PADDING_X = 27;

function subcharacteristicBadge(node: EnrichedQualityModelNode, isCollapsed: boolean): string {
  const numChildren = node.children ? node.children.length : 0;
  return isCollapsed ? `+ ${numChildren} ${numChildren === 1 ? 'medida' : 'medidas'}` : '−';
}

function measureReference(node: EnrichedQualityModelNode): string {
  const ref = formatThresholdSummary(node.min_threshold, node.max_threshold);
  return ref ? `Ref. por arquivo: ${ref}` : '';
}

/** Largura aproximada do texto; superestima um pouco para os cards não encostarem. */
function textWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.52;
}

/** Largura estimada do card de um nó, com o mesmo texto do formatter. */
export function estimateLabelWidth(node: EnrichedQualityModelNode): number {
  const weight = node.weight === null || node.weight === undefined ? '' : `  · ${node.weight}%`;

  switch (node.type) {
    case 'tsqmi':
      return textWidth(node.name, 13) + 28;
    case 'characteristic':
      return textWidth(`●  ${node.name}${weight}`, 13) + CARD_PADDING_X;
    case 'subcharacteristic':
      return textWidth(`■  ${node.name}${weight}  ${subcharacteristicBadge(node, true)}`, 13) + CARD_PADDING_X + 12;
    case 'measure':
      return (
        Math.max(textWidth(`◆  ${node.name}${weight}`, 13), textWidth(measureReference(node), 11) + 16) +
        CARD_PADDING_X
      );
    default:
      return (
        Math.max(
          textWidth(`▲  ${node.name || node.key}`, 12),
          node.isSharedMetric ? textWidth('também em outra medida', 10) + 14 : 0
        ) + CARD_PADDING_X
      );
  }
}

function hasTwoLineLabel(node: EnrichedQualityModelNode): boolean {
  return node.type === 'measure' ? Boolean(measureReference(node)) : Boolean(node.isSharedMetric);
}

export interface TreeLayoutSize {
  width: number;
  height: number;
  /** Espaço à direita do último nível, onde fica o card dele. */
  lastLevelLabelWidth: number;
}

/**
 * Tamanho que a árvore precisa com os ramos abertos agora: cada nível ganha a largura do
 * maior card do nível anterior e cada folha visível, uma linha, como no layout do ECharts.
 */
export function getTreeLayoutSize(root: EnrichedQualityModelNode): TreeLayoutSize {
  const levelWidths: number[] = [];
  const leaves: { parent: EnrichedQualityModelNode | null; twoLines: boolean }[] = [];

  const visit = (node: EnrichedQualityModelNode, depth: number, parent: EnrichedQualityModelNode | null) => {
    levelWidths[depth] = Math.max(levelWidths[depth] ?? 0, estimateLabelWidth(node));
    const visibleChildren = node.collapsed ? [] : node.children ?? [];
    if (visibleChildren.length === 0) {
      leaves.push({ parent, twoLines: hasTwoLineLabel(node) });
      return;
    }
    visibleChildren.forEach((child) => visit(child, depth + 1, node));
  };
  visit(root, 0, null);

  // o ECharts separa folhas de pais diferentes com o dobro da distância entre irmãs
  const rows = leaves.reduce(
    (total, leaf, index) => total + (index > 0 && leaf.parent !== leaves[index - 1].parent ? 2 : 1),
    1
  );
  const rowHeight = leaves.some((leaf) => leaf.twoLines) ? TWO_LINE_ROW_HEIGHT : ROW_HEIGHT;

  const lastLevel = levelWidths.length - 1;
  const levelSpacing = Math.max(0, ...levelWidths.slice(0, lastLevel)) + LEVEL_GAP;
  const lastLevelLabelWidth = levelWidths[lastLevel] + TREE_MARGIN.right;

  return {
    width: Math.ceil(TREE_MARGIN.left + lastLevel * levelSpacing + lastLevelLabelWidth),
    height: Math.ceil(TREE_MARGIN.top + TREE_MARGIN.bottom + rows * rowHeight),
    lastLevelLabelWidth: Math.ceil(lastLevelLabelWidth),
  };
}

function withNodeLabel(node: EnrichedQualityModelNode): EnrichedQualityModelNode & { label: object } {
  return {
    ...node,
    label: NODE_LABEL_STYLE[node.type],
    children: node.children.map(withNodeLabel),
  };
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
        data: [withNodeLabel(rootNode)],
        top: TREE_MARGIN.top,
        left: TREE_MARGIN.left,
        bottom: TREE_MARGIN.bottom,
        right: getTreeLayoutSize(rootNode).lastLevelLabelWidth,
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
              return `{tsqmiName|${node.name}}`;
            }

            if (node.type === 'characteristic') {
              return `{charBullet|●}  {charName|${node.name}}${formatWeightLabel(node.weight, 'weight')}`;
            }

            if (node.type === 'subcharacteristic') {
              const isCollapsed =
                params.isExpand !== undefined ? !params.isExpand : Boolean(node.collapsed);
              const badge = isCollapsed
                ? `{subBadge|${subcharacteristicBadge(node, true)}}`
                : `{subBadgeClose|${subcharacteristicBadge(node, false)}}`;

              return `{subSquare|■}  {subName|${node.name}}${formatWeightLabel(node.weight, 'weight')}  ${badge}`;
            }

            if (node.type === 'measure') {
              const ref = measureReference(node);
              const refLine = ref ? `\n{measureRef|${ref}}` : '';
              return `{measureDiamond|◆}  {measureName|${node.name}}${formatWeightLabel(node.weight, 'weightOrange')}${refLine}`;
            }

            if (node.type === 'metric') {
              const sharedLine = node.isSharedMetric ? `\n{metricShared|também em outra medida}` : '';
              return `{metricTriangle|▲}  {metricName|${node.name || node.key}}${sharedLine}`;
            }

            return node.name;
          },
          rich: {
            tsqmiName: {
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: 13,
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
