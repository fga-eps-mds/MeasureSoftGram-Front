import React from 'react';

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import Measures from '../Measures';
import mockMeasuresHistory from './mocks';

jest.mock('../hooks/useQuery', () => ({
  __esModule: true,
  default: () => ({ projectMeasuresHistory: mockMeasuresHistory })
}));

jest.mock('echarts-for-react', () => ({
  __esModule: true,
  ...jest.requireActual('echarts-for-react'),
  default: () => <div />
}));

describe('<Measures />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<Measures />);
      expect(tree).toMatchSnapshot();
    });
  });
});
