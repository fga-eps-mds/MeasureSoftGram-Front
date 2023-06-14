import React from 'react';
import { render } from '@testing-library/react';
import MeasureSoftGramChart from '../MeasureSoftGramChart';

jest.mock('@utils/formatMsgramChart', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    title: {
      text: 'title',
      subtextStyle: {
        color: '#000',
        fontSize: '12px'
      }
    },

    tooltip: {
      trigger: 'axis'
    },

    grid: [
      {
        left: 0,
        right: 0,
        height: '80px',
        x: 0,
        y: 0,
        containLabel: true
      }
    ],

    legend: [
      {
        data: ['Reability']
      }
    ],
    xAxis: [
      {
        type: 'category',
        gridIndex: 0,
        show: true
      }
    ],
    yAxis: [
      {
        max: 1,
        min: 0,
        type: 'value',
        gridIndex: 0
      }
    ],

    series: [
      {
        name: 'Reability',
        type: 'line',
        data: [0, 0.2, 0.3, 0.35, 0.3, 0.36, 0.3],
        xAxisIndex: 0,
        yAxisIndex: 0
      }
    ]
  })
}));

describe('<MeasureSoftGramChart/>', () => {
  test('Should render MeasureSoftGramChart', () => {
    const { container } = render(<MeasureSoftGramChart historical={[]} />);
    container.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
    expect(container).toMatchSnapshot();
  });
});
