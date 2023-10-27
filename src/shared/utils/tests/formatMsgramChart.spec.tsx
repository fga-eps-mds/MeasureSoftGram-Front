import formatMsgramChart from '../formatMsgramChart';
import { Historical } from '@customTypes/repository';

describe('formatMsgramChart', () => {
  const chartTitle: string = 'title-test';

  it('should return the correct chart configuration with non-empty historical data', () => {
    const historical: Historical[] = [
      {
        id: 1,
        key: 'reliability',
        name: 'Reliability',
        history: [
          {
            id: 11,
            value: 10,
            created_at: new Date(),
          },
          {
            id: 12,
            value: 20,
            created_at: new Date(),
          },
        ],
        latest: {
          id: 12,
          value: 32,
          created_at: new Date(),
        },
      },
      {
        id: 2,
        key: 'maintainability',
        name: 'Maintainability',
        history: [
          {
            id: 21,
            value: 30,
            created_at: new Date(),
          },
          {
            id: 22,
            value: 40,
            created_at: new Date(),
          },
        ],
        latest: {
          id: 22,
          value: 50,
          created_at: new Date(),
        },
      },
    ];

    const params = {
      historical,
      title: chartTitle,
      isEmpty: false,
    };

    const chartConfig = formatMsgramChart(params);

    expect(chartConfig).toMatchSnapshot();
  });

  it('should return the correct chart configuration with empty historical data', () => {
    const historical: Historical[] = [];

    const params = {
      historical,
      title: chartTitle,
      isEmpty: true,
    };

    const chartConfig = formatMsgramChart(params);

    expect(chartConfig).toMatchSnapshot();
  });
});
