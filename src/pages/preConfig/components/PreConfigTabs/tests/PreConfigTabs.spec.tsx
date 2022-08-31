import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import PreConfigTabs from '../PreConfigTabs';

const LABEL = 'SLIDER0';

const LABEL_ARRAY = ['SLIDER0', 'SLIDER1', 'SLIDER2'];

describe('<PreConfigTabs />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<PreConfigTabs onChange={jest.fn()} value={LABEL} tabsValues={LABEL_ARRAY} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
