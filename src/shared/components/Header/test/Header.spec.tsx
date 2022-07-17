import '@testing-library/jest-dom';

import React from 'react';

import { render } from '@testing-library/react';

import Header from '../Header';

describe('<Header />', () => {
  it('Deve renderizar o header', () => {
    render(<Header />);
  });
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<Header />);
      expect(tree).toMatchSnapshot();
    });
  });
});
