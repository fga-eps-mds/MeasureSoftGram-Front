import React from 'react';
import { render } from '@testing-library/react';
import formatRepositoriesTsqmiHistory from '@utils/formatRepositoriesTsqmiHistory';
import { HistoryDateRange } from '@customTypes/product';
import { CSVFilter } from '@utils/convertToCsv';
import GraphicRepositoriesTsqmiHistory from '../GraphicRepositoriesTsqmiHistory';

const dateRange: HistoryDateRange = {
  startDate: null,
  endDate: null
};

const csvFilters: CSVFilter = {
  dateRange
}

jest.mock('@utils/formatRepositoriesTsqmiHistory', () => jest.fn());

describe('GraphicRepositoriesTsqmiHistory', () => {
  it('renders without history', () => {
    const { queryByTestId } = render(<GraphicRepositoriesTsqmiHistory />);

    expect(queryByTestId('graphic-container')).toBeNull();
  });

  it('renders with history', () => {
    const history = { count: 0, results: [] };
    (formatRepositoriesTsqmiHistory as jest.Mock).mockReturnValue({ options: {}, onEvents: Function });

    const { queryByTestId } = render(<GraphicRepositoriesTsqmiHistory history={history} />);

    expect(formatRepositoriesTsqmiHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        history,
        csvFilters
      })
    );
    expect(queryByTestId('graphic-container')).toBeDefined();
  });
});

it('renders correctly with history', () => {
  const history = { count: 0, results: [] };
  (formatRepositoriesTsqmiHistory as jest.Mock).mockReturnValue({ options: {}, onEvents: Function });

  const { queryByTestId } = render(<GraphicRepositoriesTsqmiHistory history={history} />);

  expect(formatRepositoriesTsqmiHistory).toHaveBeenCalledWith(
    expect.objectContaining({
      history,
      csvFilters
    })
  );
  expect(queryByTestId('graphic-container')).toBeDefined();
  expect(queryByTestId('echarts')).toBeDefined();
});
