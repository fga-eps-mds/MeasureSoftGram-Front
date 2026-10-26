import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ECharts, { echarts } from '../EChartsCore';

const cartesian = { xAxis: { type: 'category', data: ['a', 'b'] }, yAxis: { type: 'value' } };

// um exemplo de cada tipo de gráfico que as telas montam
const SERIES: Record<string, object> = {
  bar: { ...cartesian, series: [{ type: 'bar', data: [1, 2], markLine: { data: [{ yAxis: 1 }] } }] },
  line: { ...cartesian, series: [{ type: 'line', data: [1, 2] }], dataZoom: [{ type: 'inside' }, { type: 'slider' }] },
  scatter: { ...cartesian, series: [{ type: 'scatter', data: [1, 2] }], visualMap: { min: 0, max: 2 } },
  boxplot: { ...cartesian, series: [{ type: 'boxplot', data: [[1, 2, 3, 4, 5]] }] },
  custom: { ...cartesian, series: [{ type: 'custom', renderItem: () => null, data: [1] }] },
  gauge: { series: [{ type: 'gauge', data: [{ value: 0.5 }] }] },
  radar: {
    radar: { indicator: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] },
    series: [{ type: 'radar', data: [{ value: [1, 2, 3] }] }]
  },
  tree: { series: [{ type: 'tree', data: [{ name: 'raiz', children: [{ name: 'filho' }] }] }] }
};

describe('EChartsCore', () => {
  it.each(Object.entries(SERIES))('desenha a série %s com as partes registradas', (type, option) => {
    const chart = echarts.init(document.createElement('div'), undefined, { width: 400, height: 300 });

    chart.setOption({
      title: { text: type },
      tooltip: {},
      legend: {},
      toolbox: { feature: { saveAsImage: {} } },
      aria: { enabled: true },
      ...option
    });

    expect(chart.getOption().series).toEqual([expect.objectContaining({ type })]);
    chart.dispose();
  });

  // sem o componente registrado, o ECharts ignora a marcação sem erro, e o gráfico sai sem a faixa ou sem a linha
  it.each(['markLine', 'markArea'])('desenha o %s', (marker) => {
    const chart = echarts.init(document.createElement('div'), undefined, { width: 400, height: 300 });
    const data = marker === 'markArea' ? [[{ yAxis: 1 }, { yAxis: 2 }]] : [{ yAxis: 1 }];

    chart.setOption({ ...cartesian, series: [{ type: 'line', data: [1, 2], [marker]: { data } }] });

    const model = (chart as unknown as { getModel: () => { getComponent: (type: string) => unknown } }).getModel();
    expect(model.getComponent(marker)).toBeTruthy();
    chart.dispose();
  });

  // o boxplot do nível: caixas na horizontal, uma por categoria do eixo y, e os discrepantes num scatter por cima
  it('desenha o boxplot na horizontal com os discrepantes no eixo de categorias', () => {
    const chart = echarts.init(document.createElement('div'), undefined, { width: 400, height: 300 });

    chart.setOption({
      xAxis: { type: 'value', min: 0, max: 1 },
      yAxis: { type: 'category', inverse: true, data: ['a', 'b'], splitArea: { show: true } },
      series: [
        { type: 'boxplot', data: [{ value: [0.1, 0.2, 0.3, 0.4, 0.5] }, { value: [0.2, 0.3, 0.4, 0.5, 0.6] }] },
        { type: 'scatter', data: [[0.9, 'b']] }
      ]
    });

    const model = (
      chart as unknown as {
        getModel: () => { getSeriesByType: (type: string) => { get: (option: string) => unknown }[] };
      }
    ).getModel();
    expect(model.getSeriesByType('boxplot')).toHaveLength(1);
    // no ECharts, o layout é o do eixo de categorias: vertical é o eixo y, com as caixas deitadas
    expect(model.getSeriesByType('boxplot')[0].get('layout')).toBe('vertical');
    expect(model.getSeriesByType('scatter')).toHaveLength(1);
    chart.dispose();
  });

  it('é o componente do echarts-for-react com o ECharts enxuto', async () => {
    const ref = React.createRef<ECharts>();

    render(<ECharts ref={ref} option={SERIES.line} style={{ height: 300 }} />);

    // o echarts-for-react espera o tamanho do elemento antes de aplicar a option
    await waitFor(() =>
      expect(ref.current?.getEchartsInstance().getOption()?.series).toEqual([expect.objectContaining({ type: 'line' })])
    );
    expect(echarts.getInstanceByDom(ref.current!.ele)).toBe(ref.current?.getEchartsInstance());
  });
});
