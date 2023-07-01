import { Historical } from '@customTypes/repository';
import formatGaugeChart, { FormatGaugeChartType } from '@utils/formatGaugeChart';

describe('formatGaugeChart', () => {

  const chartTitle:string = 'title-test';
  it('should return an object with the correct format', () => {
    const historic: Historical = {
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
    const historical: Historical[] = [
      historic,
      historic,
      historic,
    ];

    const params: FormatGaugeChartType = {
      historical,
      title: chartTitle,
      isEmpty: false
    }

    const values = formatGaugeChart(params);

    expect(values).toMatchSnapshot();
  });

  it('should return an object with the correct format when historical length is even', () => {
    const historic: Historical = {
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
    const historical: Historical[] = [
      historic,
      historic,
    ];

    const params: FormatGaugeChartType = {
      historical,
      title: chartTitle,
      isEmpty: false
    }

    const values = formatGaugeChart(params);

    expect(values).toMatchSnapshot();
  });

  it('should return an object considering empty historic', () => {

    const params: FormatGaugeChartType = {
      historical: undefined,
      title: 'chartTitle',
      isEmpty: false
    }

    const values = formatGaugeChart(params);

    expect(values).toMatchSnapshot();
  });
});
