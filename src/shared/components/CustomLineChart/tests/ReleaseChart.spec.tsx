import { render } from '@testing-library/react';
import CustomLineChart from '../ReleaseChart';

jest.mock('@mui/x-charts', () => ({
  LineChart: () => <div data-testid="release-chart" />
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('CustomLineChart', () => {
  const mockPlanned = [{ name: 'A', value: 0.5, diff: 0.1 }];
  const mockAccomplished = [{ name: 'A', value: 0.6, diff: 0.2 }];

  it('deve processar e renderizar o gráfico com dados válidos', () => {
    const { getByTestId } = render(
      <CustomLineChart planned={mockPlanned} accomplised={mockAccomplished} />
    );
    expect(getByTestId('release-chart')).toBeInTheDocument();
  });

  it('deve lidar com caso onde accomplished está vazio', () => {
    const { getByTestId } = render(
      <CustomLineChart planned={mockPlanned} accomplised={[]} />
    );
    expect(getByTestId('release-chart')).toBeInTheDocument();
  });
});
