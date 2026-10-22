import { RepositoryCorrelation } from '@customTypes/product';
import {
  CORRELATION_COLORS,
  correlationColor,
  correlationTextColor,
  describeCorrelation,
  formatCorrelationBubbleOptions,
  formatCorrelationInfo,
  formatCorrelationMatrixOptions,
  formatPairTooltip,
  formatSignificanceNote,
  getCorrelationCells,
  getCorrelationChartSize
} from '@utils/formatCorrelationCharts';
import { correlation } from '@pages/products/[product]/dashboards/relacoes/tests/fixtures';

type Series = {
  id: string;
  data: number[][];
  renderItem: (params: { dataIndex: number }, api: unknown) => RenderedItem;
  tooltip: { formatter?: (params: { dataIndex: number }) => string; show?: boolean };
};
type RenderedItem = {
  type: string;
  style?: Record<string, unknown>;
  shape?: Record<string, number>;
  children?: RenderedItem[];
};

/** API do ECharts para a série custom: a célula [coluna, linha] fica num grid de células de 64 px. */
function cellApi(cell: number[]) {
  return {
    value: (index: number) => cell[index],
    coord: ([column, row]: number[]) => [column * 64 + 32, row * 64 + 32],
    size: () => [64, 64]
  };
}

function render(option: { series: Series[] }, seriesId: string, dataIndex: number): RenderedItem {
  const series = option.series.find((item) => item.id === seriesId) as Series;
  return series.renderItem({ dataIndex }, cellApi(series.data[dataIndex]));
}

describe('formatCorrelationCharts', () => {
  describe('correlationColor', () => {
    it('vai do cinza claro em 0 até o laranja em −1 e o azul em +1', () => {
      expect(correlationColor(0)).toBe('rgb(241, 243, 245)');
      expect(correlationColor(1)).toBe('rgb(43, 77, 111)');
      expect(correlationColor(-1)).toBe('rgb(184, 116, 26)');
    });

    it('usa número branco só sobre as células escuras', () => {
      expect(correlationTextColor(0.95)).toBe('#FFFFFF');
      expect(correlationTextColor(0.2)).not.toBe('#FFFFFF');
      expect(correlationTextColor(-0.3)).not.toBe('#FFFFFF');
    });
  });

  it('posiciona cada par pela ordem das entidades', () => {
    const cells = getCorrelationCells(correlation());

    expect(
      cells.map(({ rowIndex, columnIndex, rowName, columnName }) => [rowIndex, columnIndex, rowName, columnName])
    ).toEqual([
      [1, 0, 'Maintainability', 'Reliability'],
      [2, 0, 'Functional Suitability', 'Reliability'],
      [2, 1, 'Functional Suitability', 'Maintainability']
    ]);
  });

  it('mostra no tooltip o par e o coeficiente', () => {
    const data = correlation();
    const [cell] = getCorrelationCells(data);

    expect(formatPairTooltip(cell, data)).toBe('Maintainability × Reliability: Spearman = <strong>0,56</strong>');
  });

  it('explica no tooltip o par sem variação', () => {
    const data = correlation({
      pairs: [{ row: 'maintainability', column: 'reliability', coefficient: null, p_value: null, significant: false }]
    });

    expect(formatPairTooltip(getCorrelationCells(data)[0], data)).toBe(
      'Maintainability × Reliability: sem correlação<br/>Uma delas não variou entre as releases'
    );
  });

  it('sem método aplicado, deixa o nome do coeficiente vazio no tooltip', () => {
    const data = correlation({ method: null });

    expect(formatPairTooltip(getCorrelationCells(data)[0], data)).toBe(
      'Maintainability × Reliability:  = <strong>0,56</strong>'
    );
  });

  it('escapa os nomes no tooltip', () => {
    const data = correlation({
      entities: [
        { key: 'reliability', name: '<b>R</b>' },
        { key: 'maintainability', name: 'M' }
      ],
      pairs: [correlation().pairs[0]]
    });

    expect(formatPairTooltip(getCorrelationCells(data)[0], data)).toContain('M × &#60;b&#62;R&#60;/b&#62;');
  });

  describe('formatCorrelationInfo', () => {
    it('informa as releases, as entidades e o coeficiente aplicado', () => {
      expect(formatCorrelationInfo(correlation())).toBe(
        '20 releases de MeasureSoftGram-Service · 3 características · coeficiente aplicado: Spearman (distribuição não normal em 3 de 3 características)'
      );
    });

    it('com Pearson, diz que a distribuição é normal em todas', () => {
      expect(
        formatCorrelationInfo(correlation({ method: 'pearson', non_normal: 0, level: 'subcharacteristic' }))
      ).toContain('coeficiente aplicado: Pearson (distribuição normal nas 3 subcaracterísticas)');
    });

    it('informa as releases deixadas de fora', () => {
      expect(formatCorrelationInfo(correlation({ excluded_releases: 1 }))).toContain(
        '· 1 release deixada de fora por falta de valor'
      );
      expect(formatCorrelationInfo(correlation({ excluded_releases: 2 }))).toContain(
        '· 2 releases deixadas de fora por falta de valor'
      );
    });
  });

  it('traz o |r| crítico e o n na nota de significância', () => {
    expect(formatSignificanceNote(correlation())).toBe(
      'Itálico e opaco: não significativo (|r| < 0,44, p < 0,05, n = 20)'
    );
  });

  it('descreve cada par no texto acessível', () => {
    expect(describeCorrelation(correlation(), 'Matriz de correlação')).toBe(
      'Matriz de correlação de Spearman entre 3 características de MeasureSoftGram-Service em 20 releases. ' +
        'Maintainability × Reliability: 0,56; Functional Suitability × Reliability: -0,32, não significativo; ' +
        'Functional Suitability × Maintainability: 0,93.'
    );
  });

  it('dimensiona o gráfico por uma célula por entidade e o espaço do último nome', () => {
    expect(getCorrelationChartSize(3)).toEqual({ width: 3 * 64 + 180, height: 3 * 64 });
  });

  describe('matriz de correlação', () => {
    const option = formatCorrelationMatrixOptions(correlation()) as unknown as { series: Series[] };

    it('desenha o triângulo de baixo e os nomes na diagonal', () => {
      const [pairs, names] = option.series;

      expect(pairs.data).toEqual([
        [0, 1],
        [0, 2],
        [1, 2]
      ]);
      expect(names.data).toEqual([
        [0, 0],
        [1, 1],
        [2, 2]
      ]);
      expect(render(option, 'names', 2).style?.text).toBe('Functional Suitability');
      expect(names.tooltip.show).toBe(false);
    });

    it('mostra o coeficiente com duas casas na cor da escala', () => {
      const [rect, text] = render(option, 'pairs', 2).children as RenderedItem[];

      expect(rect.style).toEqual({ fill: correlationColor(0.9282), opacity: 1 });
      expect(text.style).toMatchObject({ text: '0,93', fontStyle: 'normal', fill: '#FFFFFF' });
    });

    it('deixa o não significativo em itálico e opaco', () => {
      const [rect, text] = render(option, 'pairs', 1).children as RenderedItem[];

      expect(rect.style?.opacity).toBeLessThan(1);
      expect(text.style).toMatchObject({ text: '-0,32', fontStyle: 'italic' });
    });

    it('mostra "—" na célula sem variação', () => {
      const data = correlation({
        pairs: [{ row: 'maintainability', column: 'reliability', coefficient: null, p_value: null, significant: false }]
      });
      const nullOption = formatCorrelationMatrixOptions(data) as unknown as { series: Series[] };
      const [rect, text] = render(nullOption, 'pairs', 0).children as RenderedItem[];

      expect(rect.style?.fill).toBe(CORRELATION_COLORS.cell);
      expect(text.style?.text).toBe('—');
    });

    it('usa o tooltip do par', () => {
      expect(option.series[0].tooltip.formatter?.({ dataIndex: 0 })).toBe(
        'Maintainability × Reliability: Spearman = <strong>0,56</strong>'
      );
    });
  });

  describe('matriz de bolhas', () => {
    const option = formatCorrelationBubbleOptions(correlation()) as unknown as { series: Series[] };

    it('desenha um círculo cheio com raio proporcional a |r| e a cor do sinal', () => {
      const [, circle] = render(option, 'pairs', 2).children as RenderedItem[];

      expect(circle.type).toBe('circle');
      expect(circle.shape?.r).toBeCloseTo(0.9282 * (60 / 2 - 4));
      expect(circle.style).toEqual({ fill: CORRELATION_COLORS.bubble });
    });

    it('deixa vazado o não significativo, na cor do sinal', () => {
      const [, circle] = render(option, 'pairs', 1).children as RenderedItem[];

      expect(circle.style).toEqual({ fill: '#FFFFFF', stroke: CORRELATION_COLORS.negative, lineWidth: 2 });
    });

    it('mostra "—" no par sem variação', () => {
      const data = correlation({
        pairs: [{ row: 'maintainability', column: 'reliability', coefficient: null, p_value: null, significant: false }]
      });
      const nullOption = formatCorrelationBubbleOptions(data) as unknown as { series: Series[] };
      const [, text] = render(nullOption, 'pairs', 0).children as RenderedItem[];

      expect(text.style?.text).toBe('—');
    });
  });
});
