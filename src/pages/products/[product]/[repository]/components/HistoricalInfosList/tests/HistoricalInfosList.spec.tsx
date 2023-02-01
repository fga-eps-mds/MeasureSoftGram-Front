import React from 'react';
import { render } from '@testing-library/react';
import HistoricalInfosList from '../HistoricalInfosList';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

describe('HistoricalInfosList', () => {
  it('renders correctly', () => {
    const checkedOptions = {
      option1: true,
      option2: false
    };
    const { container } = render(<HistoricalInfosList checkedOptions={checkedOptions} />);
    expect(container).toMatchSnapshot();
  });
});
