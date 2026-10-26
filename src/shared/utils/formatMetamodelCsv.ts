import { QualityModelNode } from '@customTypes/metamodel';
import { DISTRIBUTION_LEVEL_LABELS } from '@utils/distributionCascade';
import { CsvChart, CsvColumn } from '@utils/exportCsv';

/** Nome do dashboard e do quadro nos arquivos exportados: `msgram-metamodelo-arvore-<data>.csv`. */
export const METAMODEL_CSV = {
  dashboard: 'metamodelo',
  tree: 'arvore'
} as const;

export type MetamodelCsvRow = {
  release: string;
  level: string;
  key: string;
  name: string;
  parent: string | null;
  weight: number | null;
  min: number | null;
  max: number | null;
};

const METAMODEL_CSV_COLUMNS: CsvColumn<MetamodelCsvRow>[] = [
  { key: 'release', title: 'Release' },
  { key: 'level', title: 'Nível' },
  { key: 'key', title: 'Chave' },
  { key: 'name', title: 'Nome' },
  { key: 'parent', title: 'Entidade pai' },
  { key: 'weight', title: 'Peso (%)' },
  { key: 'min', title: 'Mínimo' },
  { key: 'max', title: 'Máximo' }
];

function flattenTree(releaseName: string, node: QualityModelNode, parentName: string | null = null): MetamodelCsvRow[] {
  const isTsqmi = node.type === 'tsqmi';
  const isMeasure = node.type === 'measure';
  const name = node.name || node.key;
  const row: MetamodelCsvRow = {
    release: releaseName,
    level: DISTRIBUTION_LEVEL_LABELS[node.type],
    key: node.key,
    name,
    parent: parentName,
    // o TSQMI é a raiz e não tem peso (CA3)
    weight: isTsqmi ? null : node.weight ?? null,
    min: isMeasure ? node.min_threshold ?? null : null,
    max: isMeasure ? node.max_threshold ?? null : null
  };

  return [row, ...(node.children ?? []).flatMap((child) => flattenTree(releaseName, child, name))];
}

/**
 * CSV da árvore do modelo de qualidade da release escolhida: uma linha por nó, mesmo com ramos colapsados na tela,
 * com os pesos sem arredondar e cada métrica repetida sob cada medida que a usa.
 */
export function formatMetamodelCsv(
  releaseName: string,
  tree: QualityModelNode | null | undefined
): CsvChart<MetamodelCsvRow> {
  return {
    name: METAMODEL_CSV.tree,
    columns: METAMODEL_CSV_COLUMNS,
    rows: tree ? flattenTree(releaseName, tree) : []
  };
}

