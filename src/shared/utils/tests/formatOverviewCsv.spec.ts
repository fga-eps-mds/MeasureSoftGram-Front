import { analysis, characteristics, summary } from '@pages/products/[product]/dashboards/overview/tests/fixtures';
import { comparePlannedAccomplished } from '../comparePlannedAccomplished';
import { toCsv } from '../exportCsv';
import { getTotalItems, getTsqmiBars } from '../formatOverviewCharts';
import {
  OVERVIEW_CSV,
  formatIndicatorCsv,
  formatPlannedAccomplishedCsv,
  formatRadarCsv,
  formatTotalsCsv
} from '../formatOverviewCsv';

const RELEASE = '2026.2 R2';
const nameOf = (key: string) => `Nome ${key}`;

const comparisonsOf = (repositoryName: string) => {
  const { planned, accomplished } = analysis();
  const repository = accomplished.find((item) => item.repository_name === repositoryName);
  return comparePlannedAccomplished(planned, repository?.characteristics);
};

const lines = (chart: Parameters<typeof toCsv>[0]) => toCsv(chart).split('\r\n');

describe('getTotalItems', () => {
  it('lista os seis totais da release, com o rótulo do repositório do provedor', () => {
    expect(getTotalItems(summary().totals, 'Repositórios')).toEqual([
      { label: 'Características', value: 3 },
      { label: 'Subcaracterísticas', value: 6 },
      { label: 'Medidas', value: 10 },
      { label: 'Métricas', value: 14 },
      { label: 'Repositórios', value: 2 },
      { label: 'Arquivos analisados', value: 1284 }
    ]);
  });

  it('deixa o valor indefinido enquanto os totais não chegam', () => {
    expect(getTotalItems(undefined, 'Repositórios').every((item) => item.value === undefined)).toBe(true);
  });
});

describe('formatTotalsCsv', () => {
  it('exporta uma linha por total, com a release escolhida', () => {
    const chart = formatTotalsCsv(RELEASE, getTotalItems(summary().totals, 'Repositórios'));

    expect(chart.name).toBe(OVERVIEW_CSV.totals);
    expect(lines(chart)).toEqual([
      'Release,Total,Quantidade',
      '2026.2 R2,Características,3',
      '2026.2 R2,Subcaracterísticas,6',
      '2026.2 R2,Medidas,10',
      '2026.2 R2,Métricas,14',
      '2026.2 R2,Repositórios,2',
      '2026.2 R2,Arquivos analisados,1284'
    ]);
  });

  it('não exporta os totais que ainda não chegaram', () => {
    expect(formatTotalsCsv(RELEASE, getTotalItems(undefined, 'Repositórios')).rows).toEqual([]);
  });
});

describe('formatIndicatorCsv', () => {
  it('exporta o indicador e o grau de cada repositório, do maior para o menor, sem arredondar', () => {
    const chart = formatIndicatorCsv(RELEASE, getTsqmiBars(characteristics()));

    expect(chart.name).toBe(OVERVIEW_CSV.indicator);
    expect(lines(chart)).toEqual([
      'Release,Repositório,Indicador,Grau',
      '2026.2 R2,service,0.81,A',
      '2026.2 R2,front,0.72,B'
    ]);
  });

  it.each([
    [0.8, 'A'],
    [0.79, 'B'],
    [0.6, 'B'],
    [0.4, 'C'],
    [0.2, 'D'],
    [0, 'E']
  ])('dá o grau da faixa no limite %s', (value, grade) => {
    const [row] = formatIndicatorCsv(RELEASE, [{ id: 1, name: 'repo', value, previous: null }]).rows;

    expect(row.grade).toBe(grade);
  });

  it('fica sem linhas quando nenhum repositório tem indicador', () => {
    expect(formatIndicatorCsv(RELEASE, []).rows).toEqual([]);
  });
});

describe('formatPlannedAccomplishedCsv', () => {
  it('exporta o planejado, o realizado, a diferença e o desvio geral do repositório escolhido', () => {
    const chart = formatPlannedAccomplishedCsv(RELEASE, 'service', comparisonsOf('service'), 0.05, nameOf);

    expect(chart.name).toBe(OVERVIEW_CSV.plannedAccomplished);
    expect(lines(chart)).toEqual([
      'Release,Repositório,Característica,Planejado (Rp),Realizado (Rd),Diferença,Desvio geral',
      '2026.2 R2,service,Nome reliability,0.7,0.74,-0.040000000000000036,0.05',
      '2026.2 R2,service,Nome maintainability,0.8,0.78,0.020000000000000018,0.05'
    ]);
  });

  it('deixa vazios o realizado e a diferença da característica sem análise', () => {
    const chart = formatPlannedAccomplishedCsv(RELEASE, 'front', comparisonsOf('front'), 0.2, nameOf);

    expect(lines(chart)[2]).toBe('2026.2 R2,front,Nome maintainability,0.8,,,0.2');
  });

  it('deixa vazio o desvio geral quando o Service não o envia', () => {
    const chart = formatPlannedAccomplishedCsv(RELEASE, 'service', comparisonsOf('service'), undefined, nameOf);

    expect(chart.rows.every((row) => row.normDiff === null)).toBe(true);
  });

  it('escapa vírgula e aspas no nome do repositório', () => {
    const chart = formatPlannedAccomplishedCsv(RELEASE, 'a,"b"', comparisonsOf('service'), 0, nameOf);

    expect(lines(chart)[1].startsWith('2026.2 R2,"a,""b""",')).toBe(true);
  });
});

describe('formatRadarCsv', () => {
  it('exporta o valor realizado de cada eixo do radar', () => {
    const chart = formatRadarCsv(RELEASE, 'service', comparisonsOf('service'), nameOf);

    expect(chart.name).toBe(OVERVIEW_CSV.radar);
    expect(lines(chart)).toEqual([
      'Release,Repositório,Característica,Valor',
      '2026.2 R2,service,Nome reliability,0.74',
      '2026.2 R2,service,Nome maintainability,0.78'
    ]);
  });

  it('deixa o valor vazio no eixo sem realizado, como o radar sem ponto', () => {
    const chart = formatRadarCsv(RELEASE, 'front', comparisonsOf('front'), nameOf);

    expect(lines(chart)[2]).toBe('2026.2 R2,front,Nome maintainability,');
  });
});
