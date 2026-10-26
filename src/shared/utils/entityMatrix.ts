import {
  EntityMatrix,
  EntityMatrixColumn,
  EntityMatrixEntity,
  EntityMatrixLevel,
  EntityMatrixRepository,
  EntityMatrixValue
} from '@customTypes/product';
import { LEVEL_LABELS } from '@utils/entityLevels';
import { CsvChart, CsvColumn } from '@utils/exportCsv';
import { getQualityBand } from '@utils/qualityBands';

export const MATRIX_LEVELS: EntityMatrixLevel[] = ['characteristic', 'subcharacteristic', 'measure'];

/** Caminho do nível na hierarquia do modelo (CA2), do TSQMI até o nível escolhido. */
export const LEVEL_PATHS: Record<EntityMatrixLevel, string[]> = {
  characteristic: ['TSQMI', 'características'],
  subcharacteristic: ['TSQMI', 'todas as características', 'subcaracterísticas'],
  measure: ['TSQMI', 'todas as características', 'todas as subcaracterísticas', 'medidas']
};

/** Quantas células ficam destacadas como as maiores contribuições para a queda (CA4). */
export const HIGHLIGHTED_CELLS = 3;
/** Pares no quadro "O que puxa a qualidade total para baixo": os que mais mudaram o indicador (CA5). */
export const CONTRIBUTION_LIMIT = 10;
/** Pares no "Ranking dos piores pares" (CA6). */
export const RANKING_LIMIT = 10;

const decimal = (digits: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const TWO_DIGITS = decimal(2);
const THREE_DIGITS = decimal(3);

/**
 * "0,74": valores de 0 a 1 com duas casas, como no protótipo, cortados em vez de arredondados. O grau sai do valor
 * sem arredondar, então 0,795 fica "0,79 · B", e não "0,80 · B" com a legenda dizendo que A começa em 0,80.
 */
export function formatScore(value: number): string {
  // a folga evita que 0,29 (0,28999… no ponto flutuante) vire 0,28
  return TWO_DIGITS.format(Math.floor(value * 100 + 1e-9) / 100);
}

function formatSigned(value: number, format: Intl.NumberFormat): string {
  const formatted = format.format(Math.abs(value));
  if (formatted === format.format(0)) return formatted;
  return `${value < 0 ? '−' : '+'}${formatted}`;
}

/** Variação em relação à release anterior, com sinal ("−0,29"); "—" sem os dois valores (CA8). */
export function formatDelta(value: number | null, previousValue: number | null): string {
  if (value === null || previousValue === null) return '—';
  return formatSigned(value - previousValue, TWO_DIGITS);
}

/** Contribuição para a variação do TSQMI, com três casas e sinal ("−0,021"). */
export function formatContribution(contribution: number): string {
  return formatSigned(contribution, THREE_DIGITS);
}

export const cellId = (repositoryId: number, key: string) => `${repositoryId}:${key}`;

/** Linhas do pior para o melhor TSQMI; sem TSQMI vão para o fim, na ordem do nome (CA3). */
export function sortRepositoriesByTsqmi(repositories: EntityMatrixRepository[]): EntityMatrixRepository[] {
  return [...repositories].sort((a, b) => {
    const left = a.tsqmi.value;
    const right = b.tsqmi.value;
    if (left === null && right === null) return a.name.localeCompare(b.name);
    if (left === null) return 1;
    if (right === null) return -1;
    return left - right || a.name.localeCompare(b.name);
  });
}

export interface ColumnGroup extends EntityMatrixEntity {
  /** Índice da primeira coluna do grupo. */
  start: number;
  span: number;
}

/**
 * Cabeçalhos agrupados pelas entidades de cima (CA3): uma linha por nível do caminho, com as colunas seguidas do
 * mesmo pai juntas numa célula só.
 */
export function getColumnGroups(columns: EntityMatrixColumn[]): ColumnGroup[][] {
  const depth = columns[0]?.path.length ?? 0;
  return Array.from({ length: depth }, (_, index) => {
    const groups: Array<ColumnGroup & { branch: string }> = [];
    columns.forEach((column, start) => {
      const parent = column.path[index];
      // o mesmo pai só junta colunas vizinhas que também têm o mesmo caminho acima dele
      const branch = column.path
        .slice(0, index + 1)
        .map((item) => item.key)
        .join('/');
      const last = groups.at(-1);
      if (last?.branch === branch) {
        last.span += 1;
      } else {
        groups.push({ key: parent.key, name: parent.name, weight: parent.weight, start, span: 1, branch });
      }
    });
    return groups.map(({ branch, ...group }) => group);
  });
}

export interface MatrixPair {
  repository: { id: number; name: string };
  column: EntityMatrixColumn;
  value: number | null;
  previousValue: number | null;
  contribution: number | null;
}

/** Os pares repositório × entidade do mapa, na ordem das linhas e das colunas. */
export function getPairs(matrix: EntityMatrix): MatrixPair[] {
  const columns = new Map(matrix.columns.map((column) => [column.key, column]));
  return matrix.repositories.flatMap((repository) =>
    repository.cells.flatMap((cell) => {
      const column = columns.get(cell.key);
      if (!column) return [];
      return [
        {
          repository: { id: repository.id, name: repository.name },
          column,
          value: cell.value,
          previousValue: cell.previous_value,
          contribution: cell.contribution
        }
      ];
    })
  );
}

export function hasAnyValue(matrix: EntityMatrix): boolean {
  return matrix.repositories.some(
    (repository) => repository.tsqmi.value !== null || repository.cells.some((cell) => cell.value !== null)
  );
}

/** Pares do quadro de contribuição (CA5): os que mais mudaram o indicador, da maior piora para a maior melhora. */
export function getContributions(pairs: MatrixPair[], limit = CONTRIBUTION_LIMIT): MatrixPair[] {
  return pairs
    .filter((pair) => pair.contribution !== null && formatContribution(pair.contribution) !== formatContribution(0))
    .sort((a, b) => Math.abs(b.contribution as number) - Math.abs(a.contribution as number))
    .slice(0, limit)
    .sort((a, b) => (a.contribution as number) - (b.contribution as number));
}

/**
 * As células que mais puxaram o TSQMI para baixo (CA4): as primeiras pioras do quadro de contribuição. Sai dos mesmos
 * pares do quadro, para o destaque não apontar uma célula que ele não mostra, como uma que arredonda para −0,000.
 */
export function getHighlightedCells(pairs: MatrixPair[], limit = HIGHLIGHTED_CELLS): Set<string> {
  return new Set(
    getContributions(pairs)
      .filter((pair) => (pair.contribution as number) < 0)
      .slice(0, limit)
      .map((pair) => cellId(pair.repository.id, pair.column.key))
  );
}

/** Ranking dos piores pares (CA6): do menor valor para o maior, só os que têm valor. */
export function getWorstPairs(pairs: MatrixPair[], limit = RANKING_LIMIT): MatrixPair[] {
  return pairs
    .filter((pair) => pair.value !== null)
    .sort(
      (a, b) =>
        (a.value as number) - (b.value as number) ||
        a.repository.name.localeCompare(b.repository.name) ||
        a.column.key.localeCompare(b.column.key)
    )
    .slice(0, limit);
}

export interface MatrixReading {
  weakest: { column: EntityMatrixColumn; mean: number };
  widest: {
    column: EntityMatrixColumn;
    lowest: { repository: string; value: number };
    highest: { repository: string; value: number };
  } | null;
}

/**
 * Frase de leitura (CA4): a entidade mais fraca do produto (menor média entre os repositórios) e a de maior
 * dispersão (maior distância entre o menor e o maior valor). Sem nenhum valor, `null`.
 */
export function getReading(matrix: EntityMatrix): MatrixReading | null {
  const pairs = getPairs(matrix).filter((pair) => pair.value !== null);
  const byColumn = matrix.columns
    .map((column) => ({ column, pairs: pairs.filter((pair) => pair.column.key === column.key) }))
    .filter((entry) => entry.pairs.length > 0);
  if (byColumn.length === 0) return null;

  const stats = byColumn.map(({ column, pairs: columnPairs }) => {
    const sorted = [...columnPairs].sort((a, b) => (a.value as number) - (b.value as number));
    const lowest = sorted[0];
    const highest = sorted.at(-1) as MatrixPair;
    return {
      column,
      count: sorted.length,
      mean: sorted.reduce((sum, pair) => sum + (pair.value as number), 0) / sorted.length,
      lowest: { repository: lowest.repository.name, value: lowest.value as number },
      highest: { repository: highest.repository.name, value: highest.value as number }
    };
  });
  type ColumnStats = typeof stats[number];
  const spread = (entry: ColumnStats) => entry.highest.value - entry.lowest.value;

  const weakest = stats.reduce((worst, entry) => (entry.mean < worst.mean ? entry : worst), stats[0]);
  // com um repositório só não há dispersão
  const widest = stats
    .filter((entry) => entry.count > 1)
    .reduce<ColumnStats | null>((best, entry) => (best === null || spread(entry) > spread(best) ? entry : best), null);

  return {
    weakest: { column: weakest.column, mean: weakest.mean },
    widest: widest && { column: widest.column, lowest: widest.lowest, highest: widest.highest }
  };
}

/** Nomes dos arquivos: `msgram-entidade-<quadro>-<data>.csv` e o `.zip` com os três. */
export const ENTITY_CSV = {
  dashboard: 'entidade',
  heatmap: 'mapa-calor',
  contribution: 'contribuicao',
  ranking: 'ranking'
};

const variation = ({ value, previous_value: previousValue }: EntityMatrixValue) =>
  value === null || previousValue === null ? null : value - previousValue;

const gradeOf = (value: number | null) => (value === null ? null : getQualityBand(value)?.grade ?? null);

const releaseFields = (matrix: EntityMatrix) => ({
  release: matrix.release.release_name,
  level: LEVEL_LABELS[matrix.level]
});

const entityFields = (column: EntityMatrixColumn) => ({ entity: column.name, key: column.key });

const RELEASE_COLUMNS = [
  { key: 'release', title: 'Release' },
  { key: 'level', title: 'Nível' }
] as const;

const ENTITY_COLUMNS = [
  { key: 'repository', title: 'Repositório' },
  { key: 'entity', title: 'Entidade' },
  { key: 'key', title: 'Chave da entidade' }
] as const;

export type EntityHeatmapCsvRow = {
  release: string;
  level: string;
  repository: string;
  entity: string;
  key: string;
  path: string;
  weight: number | null;
  value: number | null;
  grade: string | null;
  tsqmi: number | null;
  tsqmi_grade: string | null;
  tsqmi_variation: number | null;
};

const HEATMAP_CSV_COLUMNS: CsvColumn<EntityHeatmapCsvRow>[] = [
  ...RELEASE_COLUMNS,
  ...ENTITY_COLUMNS,
  { key: 'path', title: 'Entidades de cima' },
  { key: 'weight', title: 'Peso (%)' },
  { key: 'value', title: 'Valor' },
  { key: 'grade', title: 'Grau' },
  { key: 'tsqmi', title: 'Indicador Total da Qualidade' },
  { key: 'tsqmi_grade', title: 'Grau do indicador' },
  { key: 'tsqmi_variation', title: 'Variação do indicador' }
];

/**
 * CSV do mapa de calor: uma linha por célula, na ordem da tela (linhas do pior para o melhor TSQMI), com a célula
 * "sem dado" e a variação da primeira release vazias.
 */
export function formatEntityHeatmapCsv(matrix: EntityMatrix): CsvChart<EntityHeatmapCsvRow> {
  return {
    name: ENTITY_CSV.heatmap,
    columns: HEATMAP_CSV_COLUMNS,
    rows: sortRepositoriesByTsqmi(matrix.repositories).flatMap((repository) => {
      const cells = new Map(repository.cells.map((cell) => [cell.key, cell]));
      return matrix.columns.map((column) => {
        const value = cells.get(column.key)?.value ?? null;
        return {
          ...releaseFields(matrix),
          repository: repository.name,
          ...entityFields(column),
          path: column.path.map((parent) => parent.name).join(' › '),
          weight: column.weight,
          value,
          grade: gradeOf(value),
          tsqmi: repository.tsqmi.value,
          tsqmi_grade: gradeOf(repository.tsqmi.value),
          tsqmi_variation: variation(repository.tsqmi)
        };
      });
    })
  };
}

export type EntityContributionCsvRow = {
  release: string;
  previous_release: string;
  level: string;
  repository: string;
  entity: string;
  key: string;
  value: number | null;
  previous_value: number | null;
  contribution: number | null;
};

const CONTRIBUTION_CSV_COLUMNS: CsvColumn<EntityContributionCsvRow>[] = [
  RELEASE_COLUMNS[0],
  { key: 'previous_release', title: 'Release anterior' },
  RELEASE_COLUMNS[1],
  ...ENTITY_COLUMNS,
  { key: 'value', title: 'Valor' },
  { key: 'previous_value', title: 'Valor na release anterior' },
  { key: 'contribution', title: 'Contribuição para a variação do indicador' }
];

/** CSV de "O que puxa a qualidade total para baixo": os pares do quadro, na ordem da tela; vazio na primeira release. */
export function formatEntityContributionCsv(
  matrix: EntityMatrix,
  contributions: MatrixPair[]
): CsvChart<EntityContributionCsvRow> {
  const previousRelease = matrix.previous_release;
  return {
    name: ENTITY_CSV.contribution,
    columns: CONTRIBUTION_CSV_COLUMNS,
    rows: previousRelease
      ? contributions.map((pair) => ({
          ...releaseFields(matrix),
          previous_release: previousRelease.release_name,
          repository: pair.repository.name,
          ...entityFields(pair.column),
          value: pair.value,
          previous_value: pair.previousValue,
          contribution: pair.contribution
        }))
      : []
  };
}

export type EntityRankingCsvRow = {
  release: string;
  level: string;
  position: number;
  repository: string;
  entity: string;
  key: string;
  value: number | null;
  grade: string | null;
  variation: number | null;
};

const RANKING_CSV_COLUMNS: CsvColumn<EntityRankingCsvRow>[] = [
  ...RELEASE_COLUMNS,
  { key: 'position', title: 'Posição' },
  ...ENTITY_COLUMNS,
  { key: 'value', title: 'Valor' },
  { key: 'grade', title: 'Grau' },
  { key: 'variation', title: 'Variação' }
];

/** CSV do "Ranking dos piores pares": a posição na tela, o valor, o grau e a variação (vazia na primeira release). */
export function formatEntityRankingCsv(matrix: EntityMatrix, worstPairs: MatrixPair[]): CsvChart<EntityRankingCsvRow> {
  return {
    name: ENTITY_CSV.ranking,
    columns: RANKING_CSV_COLUMNS,
    rows: worstPairs.map((pair, index) => ({
      ...releaseFields(matrix),
      position: index + 1,
      repository: pair.repository.name,
      ...entityFields(pair.column),
      value: pair.value,
      grade: gradeOf(pair.value),
      variation: variation({ value: pair.value, previous_value: pair.previousValue })
    }))
  };
}
