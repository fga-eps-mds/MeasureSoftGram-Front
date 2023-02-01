import React from 'react';
import { render, cleanup } from '@testing-library/react';
import SubCharacteristicsGraph from '../SubCharacteristicsGraph';

describe('SubCharacteristicsGraph component', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    const SQC = {
      value: 10,
      created_at: '2023-01-30T00:00:00.000Z'
    };
    const checkedOptions = {};
    const subCharacteristics = [];
    const { getByTestId } = render(
      <SubCharacteristicsGraph SQC={SQC} checkedOptions={checkedOptions} subCharacteristics={subCharacteristics} />
    );
    expect(getByTestId('sub-characteristics-graph')).toBeTruthy();
  });

  it('renders open and close correctly', () => {
    const SQC = {
      value: 10,
      created_at: '2023-01-30T00:00:00.000Z'
    };
    const checkedOptions = {};
    const subCharacteristics = [];
    const { getByTestId } = render(
      <SubCharacteristicsGraph SQC={SQC} checkedOptions={checkedOptions} subCharacteristics={subCharacteristics} />
    );
    const openRow = getByTestId('open-row');
    openRow.click();
    expect(getByTestId('open').innerHTML).toContain('<svg');
    openRow.click();
    expect(getByTestId('open').innerHTML).toContain('<svg');
  });
});
