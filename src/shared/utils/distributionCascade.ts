import { QualityModelNode } from '@customTypes/metamodel';
import { DistributionLevel, EntityLevel } from '@customTypes/product';
import { LEVEL_LABELS } from '@utils/formatEntityAnalysisChart';

/** Níveis do seletor da Distribuição Estatística, do topo do modelo para baixo. */
export const DISTRIBUTION_LEVELS: DistributionLevel[] = [
  'tsqmi',
  'characteristic',
  'subcharacteristic',
  'measure',
  'metric'
];

export const DISTRIBUTION_LEVEL_LABELS: Record<DistributionLevel, string> = { tsqmi: 'TSQMI', ...LEVEL_LABELS };

/** Níveis que têm seletor de entidade, na ordem da cascata; o TSQMI é um só e não tem. */
const ENTITY_LEVELS: EntityLevel[] = ['characteristic', 'subcharacteristic', 'measure', 'metric'];

/** Chave escolhida em cada nível da cascata. */
export type EntitySelection = Partial<Record<EntityLevel, string>>;

export interface EntityOption {
  key: string;
  name: string;
}

export interface EntitySelector {
  level: EntityLevel;
  label: string;
  options: EntityOption[];
  /** A entidade em vigor: a escolhida, se ainda estiver entre as opções, ou a primeira; undefined sem opções. */
  value?: string;
}

/** Um seletor por nível, do topo até o nível escolhido; nenhum no TSQMI. */
export function getSelectorLevels(level: DistributionLevel): EntityLevel[] {
  return ENTITY_LEVELS.slice(0, ENTITY_LEVELS.indexOf(level as EntityLevel) + 1);
}

/** Se o ramo do nó chega a alguma entidade escolhível no nível alvo; métricas só com valor por análise. */
function reaches(node: QualityModelNode, target: EntityLevel, trackedMetrics: ReadonlySet<string>): boolean {
  if (node.type === target) return node.type !== 'metric' || trackedMetrics.has(node.key);
  return node.children.some((child) => reaches(child, target, trackedMetrics));
}

/**
 * Seletores em cascata sobre a árvore do modelo da release (CA2). As opções de cada nível são os filhos da entidade em
 * vigor no nível de cima (no primeiro, as características do TSQMI), só nos ramos que chegam a alguma entidade
 * escolhível no nível pedido. No nível métrica, só as métricas com valor por análise (`trackedMetrics`, as TRK) são
 * escolhíveis; assim nenhuma característica, subcaracterística ou medida leva a uma lista vazia. A entidade em vigor é
 * decidida aqui, no render, e não guardada: trocar a release ou o nível nunca pede uma chave fora da configuração.
 */
export function buildEntitySelectors(
  tree: QualityModelNode | null | undefined,
  level: DistributionLevel,
  selection: EntitySelection,
  trackedMetrics: ReadonlySet<string> = new Set()
): EntitySelector[] {
  const levels = getSelectorLevels(level);
  const target = levels[levels.length - 1];
  let parent = tree ?? undefined;

  return levels.map((selectorLevel) => {
    const nodes = (parent?.children ?? []).filter(
      (child) => child.type === selectorLevel && reaches(child, target, trackedMetrics)
    );
    const current = nodes.find((node) => node.key === selection[selectorLevel]) ?? nodes[0];
    parent = current;
    return {
      level: selectorLevel,
      label: LEVEL_LABELS[selectorLevel],
      options: nodes.map(({ key, name }) => ({ key, name })),
      value: current?.key
    };
  });
}

/**
 * Escolha de uma entidade num seletor: fixa as entidades em vigor nos níveis de cima e limpa as dos de baixo, que
 * voltam à primeira opção do ramo novo.
 */
export function selectEntity(selectors: EntitySelector[], level: EntityLevel, key: string): EntitySelection {
  const selection: EntitySelection = {};
  const index = selectors.findIndex((selector) => selector.level === level);
  selectors.slice(0, index).forEach((selector) => {
    selection[selector.level] = selector.value;
  });
  selection[level] = key;
  return selection;
}

/** A entidade do último seletor, que é a pedida ao Service; no TSQMI não há. */
export function getSelectedEntity(selectors: EntitySelector[]): EntityOption | undefined {
  const last = selectors[selectors.length - 1];
  return last?.options.find((option) => option.key === last.value);
}
