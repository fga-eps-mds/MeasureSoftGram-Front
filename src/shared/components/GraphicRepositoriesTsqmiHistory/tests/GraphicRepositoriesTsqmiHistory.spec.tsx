import React from 'react';
import { render } from '@testing-library/react';
import formatRepositoriesTsqmiHistory from '@utils/formatRepositoriesTsqmiHistory';
import GraphicRepositoriesTsqmiHistory from '../GraphicRepositoriesTsqmiHistory';

jest.mock('@utils/formatRepositoriesTsqmiHistory', () => jest.fn());

describe('GraphicRepositoriesTsqmiHistory', () => {
  it('renders without history', () => {
    const { queryByTestId } = render(<GraphicRepositoriesTsqmiHistory />);

    expect(queryByTestId('graphic-container')).toBeNull();
  });

  it('renders with history', () => {
    const history = {};
    (formatRepositoriesTsqmiHistory as jest.Mock).mockReturnValue({});

    const { queryByTestId } = render(<GraphicRepositoriesTsqmiHistory history={history} />);

    expect(formatRepositoriesTsqmiHistory).toHaveBeenCalledWith(history);
    expect(queryByTestId('graphic-container')).toBeDefined();
  });
});

it('renders correctly with history', () => {
  const history = {};
  (formatRepositoriesTsqmiHistory as jest.Mock).mockReturnValue({});

  const { queryByTestId } = render(<GraphicRepositoriesTsqmiHistory history={history} />);

  expect(formatRepositoriesTsqmiHistory).toHaveBeenCalledWith(history);
  expect(queryByTestId('graphic-container')).toBeDefined();
  expect(queryByTestId('echarts')).toBeDefined();
});
