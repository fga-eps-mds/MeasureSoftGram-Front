import { Historical } from '@customTypes/repository';
import formatRadarChart, { FormatRadarChartType } from '@utils/formatRadarChart';

describe('formatGaugeChart', () => {
  it('should return an object with the correct format', () => {
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

    const params: FormatRadarChartType = {
      historical,
      title: 'title-test',
      isEmpty: false
    }

    const values = formatRadarChart(params);

    expect(values).toMatchSnapshot();
  });

  it('should return an default object when historical param undefined', () => {
    const params: FormatRadarChartType = {
      historical: undefined,
      title: 'title-test',
      isEmpty: false
    }

    const values = formatRadarChart(params);

    expect(values).toMatchSnapshot();
  });
});
