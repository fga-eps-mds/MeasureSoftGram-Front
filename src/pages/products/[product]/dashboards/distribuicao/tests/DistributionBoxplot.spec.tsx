import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DistributionEntity } from '@customTypes/product';
import { BOXPLOT_GRID, BOXPLOT_ROW_HEIGHT, getLevelBoxplotHeight } from '@utils/formatDistributionCharts';
import DistributionBoxplot from '../DistributionBoxplot';
import { emptySummary, entity } from './fixtures';

type ChartOption = {
  xAxis: { min: number; max: number };
  yAxis: { data: string[] };
  series: { data: unknown[] }[];
};

// o ECharts não roda no jsdom: o mock mostra as linhas, o eixo, os discrepantes e a altura que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option, style }: { option: ChartOption; style: { height: number } }) => (
  <div data-testid="echarts">
    {JSON.stringify({
      rows: option.yAxis.data,
      xAxis: { min: option.xAxis.min, max: option.xAxis.max },
      boxes: option.series[0].data.length,
      outliers: option.series[1].data,
      height: style.height
    })}
  </div>
));

function chart() {
  return JSON.parse(screen.getByTestId('echarts').textContent ?? '{}');
}

/** Nome e valores de cada linha da tabela de percentis. */
function tableRows() {
  return screen.getAllByTestId('percentile-row').map((row) =>
    within(row)
      .getAllByRole(/cell|rowheader/)
      .map((cell) => cell.textContent)
  );
}

const characteristics = [
  entity('reliability', 'Reliability', 'characteristic'),
  entity('maintainability', 'Maintainability', 'characteristic'),
  entity('functional_suitability', 'Functional Suitability', 'characteristic')
];

function renderBoxplot(main: DistributionEntity, children: DistributionEntity[]) {
  return render(<DistributionBoxplot entity={main} childEntities={children} />);
}

describe('<DistributionBoxplot />', () => {
  it('no TSQMI, desenha uma linha para ele e uma para cada característica, na ordem da release (CA6)', () => {
    renderBoxplot(entity('tsqmi', 'TSQMI', 'tsqmi'), characteristics);

    expect(screen.getByRole('region', { name: 'Boxplot e percentis do nível' })).toBeInTheDocument();
    expect(chart().rows).toEqual(['tsqmi', 'reliability', 'maintainability', 'functional_suitability']);
    expect(chart().boxes).toBe(4);
    expect(chart().xAxis).toEqual({ min: 0, max: 1 });
    expect(tableRows().map(([name]) => name)).toEqual([
      'TSQMI',
      'Reliability',
      'Maintainability',
      'Functional Suitability'
    ]);
    expect(screen.getAllByTestId('percentile-row')[0]).toHaveAttribute('data-chosen', 'true');
  });

  it('mostra P10, Q1, mediana em negrito, Q3, P90, IQR e discrepantes com duas casas', () => {
    renderBoxplot(entity('tsqmi', 'TSQMI', 'tsqmi'), characteristics);

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(['Entidade', 'P10', 'Q1', 'Mediana', 'Q3', 'P90', 'IQR', 'Discrepantes']);
    expect(tableRows()[0]).toEqual(['TSQMI', '0,39', '0,51', '0,56', '0,60', '0,75', '0,09', '2']);
    // no sx do MUI, o bold vira o fontWeightBold do tema
    const child = within(screen.getAllByTestId('percentile-row')[1]);
    expect(child.getByText('0,56')).toHaveStyle({ fontWeight: 700 });
    expect(child.getByText('0,39')).not.toHaveStyle({ fontWeight: 700 });
  });

  it('desenha os discrepantes de cada linha, com a legenda e a nota do quadro', () => {
    renderBoxplot(entity('tsqmi', 'TSQMI', 'tsqmi'), characteristics.slice(0, 1));

    expect(chart().outliers).toEqual([
      [0.31, 'tsqmi'],
      [0.9, 'tsqmi'],
      [0.31, 'reliability'],
      [0.9, 'reliability']
    ]);
    const legend = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(legend).toEqual(['Entidade escolhida', 'Filhos no modelo', 'Valor discrepante']);
    expect(screen.getByRole('region', { name: 'Boxplot e percentis do nível' })).toHaveTextContent(
      'Os círculos vazados são os valores discrepantes'
    );
  });

  it('alinha as linhas da tabela às faixas do gráfico', () => {
    renderBoxplot(entity('tsqmi', 'TSQMI', 'tsqmi'), characteristics);

    expect(chart().height).toBe(getLevelBoxplotHeight(4));
    expect(screen.getAllByRole('row')[0]).toHaveStyle({ height: `${BOXPLOT_GRID.top}px` });
    screen.getAllByTestId('percentile-row').forEach((row) => {
      expect(row).toHaveStyle({ height: `${BOXPLOT_ROW_HEIGHT}px` });
    });
  });

  it('a tabela de percentis rola na horizontal, sem levar o gráfico junto', () => {
    renderBoxplot(entity('tsqmi', 'TSQMI', 'tsqmi'), characteristics);

    const scroll = screen.getByRole('group', { name: 'Percentis de cada linha' });
    expect(scroll).toHaveStyle({ overflowX: 'auto', position: 'relative' });
    expect(within(scroll).getByRole('table')).toBeInTheDocument();
    expect(within(scroll).queryByTestId('echarts')).not.toBeInTheDocument();
  });

  it('na característica, mostra as subcaracterísticas', () => {
    renderBoxplot(entity('reliability', 'Reliability', 'characteristic'), [
      entity('testing_status', 'Testing Status', 'subcharacteristic'),
      entity('maturity', 'Maturity', 'subcharacteristic')
    ]);

    expect(chart().rows).toEqual(['reliability', 'testing_status', 'maturity']);
  });

  it('na subcaracterística, mostra as medidas', () => {
    renderBoxplot(entity('testing_status', 'Testing Status', 'subcharacteristic'), [
      entity('passed_tests', 'Passed Tests', 'measure'),
      entity('test_builds', 'Test Builds', 'measure')
    ]);

    expect(chart().rows).toEqual(['testing_status', 'passed_tests', 'test_builds']);
  });

  it('na medida, mostra só a linha dela e explica que as métricas têm escala própria', () => {
    renderBoxplot(entity('ci_feedback_time', 'CI Feedback Time', 'measure'), [
      entity('total_builds', 'total_builds', 'metric', [42, 44, 47, 55, 63], 'INT')
    ]);

    expect(chart().rows).toEqual(['ci_feedback_time']);
    expect(chart().xAxis).toEqual({ min: 0, max: 1 });
    expect(screen.getByTestId('boxplot-metric-note')).toHaveTextContent(
      'As métricas de CI Feedback Time têm escala própria e não cabem no eixo de 0 a 1.'
    );
  });

  it('numa medida sem métricas com valor por análise, só a linha dela, sem a nota', () => {
    renderBoxplot(entity('passed_tests', 'Passed Tests', 'measure'), []);

    expect(chart().rows).toEqual(['passed_tests']);
    expect(screen.queryByTestId('boxplot-metric-note')).not.toBeInTheDocument();
  });

  it('no nível métrica, só a linha da entidade, na escala dela', () => {
    renderBoxplot(entity('total_issues', 'total_issues', 'metric', [42, 44, 47, 55, 63], 'INT'), []);

    expect(chart().rows).toEqual(['total_issues']);
    expect(chart().xAxis).toEqual({ min: 40, max: 65 });
    expect(tableRows()).toHaveLength(1);
  });

  it('deixa de fora um filho sem análises', () => {
    const withoutAnalyses = { ...entity('maturity', 'Maturity', 'subcharacteristic', []), summary: emptySummary };

    renderBoxplot(entity('reliability', 'Reliability', 'characteristic'), [
      withoutAnalyses,
      entity('testing_status', 'Testing Status', 'subcharacteristic')
    ]);

    expect(chart().rows).toEqual(['reliability', 'testing_status']);
    expect(tableRows().map(([name]) => name)).toEqual(['Reliability', 'Testing Status']);
  });
});
