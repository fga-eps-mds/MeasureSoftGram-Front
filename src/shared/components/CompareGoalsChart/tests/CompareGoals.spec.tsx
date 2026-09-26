import React from 'react';
import { render, screen } from '@testing-library/react';
import { IReleases } from '@customTypes/product';
import formatCompareGoalsChart from '@utils/formatCompareGoalsChart';
import CompareGoalsChart from '../CompareGoalsChart';

jest.mock('@utils/formatCompareGoalsChart');
jest.mock('echarts-for-react', () => ({
  __esModule: true,
  default: () => <div data-testid="react-echarts" />,
}));
jest.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div data-testid="mui-box">{children}</div>,
}));

describe('CompareGoalsChart', () => {
  const mockRelease: IReleases = {
    id: 1,
    release_name: 'Release 1',
    start_at: '2024-09-01',
    end_at: '2024-09-30',
    created_by: 'User1',
    product: 101,
    goal: 100,
    description: 'Test release',
  };

  beforeEach(() => {
    (formatCompareGoalsChart as jest.Mock).mockReturnValue({});
  });

  it('should render null if release is not provided', () => {
    render(<CompareGoalsChart release={null as unknown as IReleases} />);
    expect(screen.queryByTestId('mui-box')).toBeNull();
  });

  it('should render the chart with formatted options when release is provided', async () => {
    render(<CompareGoalsChart release={mockRelease} />);
    expect(formatCompareGoalsChart).toHaveBeenCalledWith(mockRelease);
    expect(screen.getByTestId('mui-box')).toBeInTheDocument();

    const chartElement = await screen.findByTestId('react-echarts');
    expect(chartElement).toBeInTheDocument();
  });
});
