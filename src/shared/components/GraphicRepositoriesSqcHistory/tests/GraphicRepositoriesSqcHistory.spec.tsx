import React from 'react';
import { render } from '@testing-library/react';
import formatRepositoriesSqcHistory from '@utils/formatRepositoriesSqcHistory';
import GraphicRepositoriesSqcHistory from '../GraphicRepositoriesSqcHistory';

jest.mock('@utils/formatRepositoriesSqcHistory', () => jest.fn());

describe('GraphicRepositoriesSqcHistory', () => {
  it('renders without history', () => {
    const { queryByTestId } = render(<GraphicRepositoriesSqcHistory />);

    expect(queryByTestId('graphic-container')).toBeNull();
  });

  it('renders with history', () => {
    const history = {};
    (formatRepositoriesSqcHistory as jest.Mock).mockReturnValue({});

    const { queryByTestId } = render(<GraphicRepositoriesSqcHistory history={history} />);

    expect(formatRepositoriesSqcHistory).toHaveBeenCalledWith(history);
    expect(queryByTestId('graphic-container')).toBeDefined();
  });
});

it('renders correctly with history', () => {
  const history = {};
  (formatRepositoriesSqcHistory as jest.Mock).mockReturnValue({});

  const { queryByTestId } = render(<GraphicRepositoriesSqcHistory history={history} />);

  expect(formatRepositoriesSqcHistory).toHaveBeenCalledWith(history);
  expect(queryByTestId('graphic-container')).toBeDefined();
  expect(queryByTestId('echarts')).toBeDefined();
});
