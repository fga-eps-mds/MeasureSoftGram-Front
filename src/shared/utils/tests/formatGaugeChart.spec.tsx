import { Historical } from '@customTypes/repository';
import formatGaugeChart, { FormatGaugeChartType } from '@utils/formatGaugeChart';

describe('formatGaugeChart', () => {
  test('should return an object with the correct format', () => {
    const historical: Historical[] = [
      {
        id: 1,
        key: 'reliability',
        name: 'Reliability',
        history: [],
        latest: {
          id: 12,
          value: 32,
          created_at: new Date(),
        }
      }
    ];

    const params: FormatGaugeChartType = {
      historical,
      title: 'title-test',
      isEmpty: false
    }

    const values = formatGaugeChart(params);

    expect(values).toMatchSnapshot();
  });
});
