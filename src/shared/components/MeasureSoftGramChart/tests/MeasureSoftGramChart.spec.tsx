import React from 'react';
import { render, act } from '@testing-library/react';
import formatMsgramChart from '@utils/formatMsgramChart';
import MeasureSoftGramChart from '../MeasureSoftGramChart';

jest.mock('@utils/formatMsgramChart');

describe('MeasureSoftGramChart formatGraph', () => {
  beforeEach(() => {
    formatMsgramChart.mockReturnValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call formatMsgramChart with the correct arguments', () => {
    const historical = [{ date: '2021-01-01', value: 10 }];
    const repositoryName = 'test-repo';
    act(() => {
      render(<MeasureSoftGramChart historical={historical} repositoryName={repositoryName} />);
    });
    expect(formatMsgramChart).toHaveBeenCalledWith({ historical, repositoryName });
  });
});
