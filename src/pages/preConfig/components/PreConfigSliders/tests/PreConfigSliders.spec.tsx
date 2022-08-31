import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import PreConfigSliders from '../PreConfigSliders';

const LABEL = 'SLIDER';
const WEIGHT = 100;

describe('<PreConfigSliders />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<PreConfigSliders label={LABEL} onChange={jest.fn()} weight={WEIGHT} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
